import type { Express, Request, Response } from "express";
import { db } from "./db";
import { metricsSnapshots, systemAlerts, integrationHealth, jobMetrics, portalMetrics, auditRecords, moduleRegistry } from "../shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { metricsCollector } from "./services/metrics-collector";
import { alertEvaluator } from "./services/alert-evaluator";
import { getJobStats } from "./job-queue";
import { performanceMonitor } from "./services/performance-monitor";

function toISOString(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === "string") return date;
  return date.toISOString();
}

function toISOStringNow(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString();
  if (typeof date === "string") return date;
  return date.toISOString();
}

export function registerSystemStatusRoutes(app: Express) {
  app.get("/api/system/overview", async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

      const [apiSnapshot, dbSnapshot, redisSnapshot, jobSnapshot] = await Promise.all([
        metricsCollector.getLatestSnapshot("api"),
        metricsCollector.getLatestSnapshot("database"),
        metricsCollector.getLatestSnapshot("redis"),
        metricsCollector.getLatestSnapshot("job_queue"),
      ]);

      const alertStats = await alertEvaluator.getAlertStats();
      const activeAlerts = await alertEvaluator.getActiveAlerts();
      const perfStats = performanceMonitor.getStats();

      const apiMetrics = apiSnapshot?.metrics as Record<string, unknown> || {};
      const dbMetrics = dbSnapshot?.metrics as Record<string, unknown> || {};
      const redisMetrics = redisSnapshot?.metrics as Record<string, unknown> || {};
      const jobMetrics = jobSnapshot?.metrics as Record<string, unknown> || {};

      let globalStatus: "green" | "yellow" | "red" = "green";
      if (alertStats.criticalCount > 0) {
        globalStatus = "red";
      } else if (alertStats.warningCount > 0) {
        globalStatus = "yellow";
      }

      const slowEndpoints = (apiMetrics.slowEndpoints as Array<{ endpoint: string; p95: number }>) || [];
      const slowQueries = (dbMetrics.slowQueries as Array<{ query: string; durationMs: number }>) || [];

      res.json({
        globalStatus,
        lastUpdated: toISOStringNow(apiSnapshot?.collectedAt),
        kpis: {
          apiP95Latency: apiMetrics.p95LatencyMs || 0,
          dbP95Latency: dbMetrics.p95LatencyMs || 0,
          errorRate5xx: apiMetrics.errorRate5xx || 0,
          redisP95Latency: redisMetrics.p95LatencyMs || 0,
          queuedJobs: jobMetrics.queuedJobs || 0,
          stuckJobs: jobMetrics.stuckJobCount || 0,
          activeAlerts: alertStats.criticalCount + alertStats.warningCount,
          violationsLast15m: perfStats.last15Minutes,
        },
        activeAlerts: activeAlerts.slice(0, 10).map(a => ({
          ...a,
          firstSeenAt: toISOString(a.firstSeenAt),
          lastSeenAt: toISOString(a.lastSeenAt),
          acknowledgedAt: a.acknowledgedAt ? toISOString(a.acknowledgedAt) : null,
          resolvedAt: a.resolvedAt ? toISOString(a.resolvedAt) : null,
          snoozedUntil: a.snoozedUntil ? toISOString(a.snoozedUntil) : null,
          createdAt: toISOString(a.createdAt),
          updatedAt: toISOString(a.updatedAt),
        })),
        topSlowEndpoints: slowEndpoints.slice(0, 5),
        topSlowQueries: slowQueries.slice(0, 5),
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching overview:", error);
      res.status(500).json({ error: "Failed to fetch system overview" });
    }
  });

  app.get("/api/system/performance", async (req: Request, res: Response) => {
    try {
      const budgets = [
        {
          name: "API List Endpoints",
          metricType: "api",
          target: { p95: 120, p99: 250 },
          window: "15m",
        },
        {
          name: "API Detail Endpoints",
          metricType: "api",
          target: { p95: 180, p99: 350 },
          window: "15m",
        },
        {
          name: "Database Query",
          metricType: "database",
          target: { p95: 60, p99: 150 },
          window: "15m",
        },
        {
          name: "Redis Latency",
          metricType: "redis",
          target: { warning: 30, critical: 100 },
          window: "5m",
        },
        {
          name: "R2 Latency",
          metricType: "r2",
          target: { warning: 300, critical: 1000 },
          window: "5m",
        },
        {
          name: "DataQueue Stuck Jobs",
          metricType: "job_queue",
          target: { warning: 3, critical: 10 },
          window: "10m",
          unit: "minutes",
        },
      ];

      const snapshotsPromises = ["api", "database", "redis", "r2", "job_queue"].map(type =>
        metricsCollector.getLatestSnapshot(type as "api" | "database" | "redis" | "r2" | "job_queue")
      );
      const snapshots = await Promise.all(snapshotsPromises);

      const budgetStatuses = budgets.map((budget, i) => {
        const snapshot = snapshots.find((_, idx) => 
          ["api", "database", "redis", "r2", "job_queue"][idx] === budget.metricType
        );
        const metrics = snapshot?.metrics as Record<string, number> || {};
        const currentP95 = metrics.p95LatencyMs || 0;

        let status: "green" | "yellow" | "red" = "green";
        const target = budget.target as unknown as Record<string, number | undefined>;
        const critical = target.critical;
        const warning = target.warning;
        const p99 = target.p99;
        const p95 = target.p95;
        
        if (critical !== undefined && currentP95 >= critical) {
          status = "red";
        } else if (warning !== undefined && currentP95 >= warning) {
          status = "yellow";
        } else if (p99 !== undefined && currentP95 >= p99) {
          status = "red";
        } else if (p95 !== undefined && currentP95 >= p95) {
          status = "yellow";
        }

        return {
          ...budget,
          currentValue: currentP95,
          status,
          lastUpdated: toISOString(snapshot?.collectedAt),
        };
      });

      const latestSnapshot = snapshots.find(s => s !== null);
      res.json({ 
        budgets: budgetStatuses,
        lastUpdated: toISOStringNow(latestSnapshot?.collectedAt),
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching performance budgets:", error);
      res.status(500).json({ error: "Failed to fetch performance budgets" });
    }
  });

  app.get("/api/system/health", async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const checks: Array<{ component: string; status: string; latency: number; checkedAt: string | null }> = [];

      // Check API Server (self-ping)
      const apiStart = Date.now();
      checks.push({ component: "API Server", status: "pass", latency: Date.now() - apiStart, checkedAt: toISOStringNow(now) });

      // Check PostgreSQL with actual query
      const dbStart = Date.now();
      let dbStatus = "pass";
      try {
        await db.execute(sql`SELECT 1`);
      } catch {
        dbStatus = "fail";
      }
      checks.push({ component: "PostgreSQL", status: dbStatus, latency: Date.now() - dbStart, checkedAt: toISOStringNow(now) });

      // Check Redis
      const redisStart = Date.now();
      let redisStatus = "pass";
      try {
        const { getRedisClient } = await import("./services/redis-session");
        const redisClient = getRedisClient();
        if (redisClient) {
          await redisClient.ping();
        } else {
          redisStatus = "degraded";
        }
      } catch {
        redisStatus = "degraded";
      }
      checks.push({ component: "Redis", status: redisStatus, latency: Date.now() - redisStart, checkedAt: toISOStringNow(now) });

      // Check R2 Storage
      const r2Start = Date.now();
      let r2Status = "pass";
      try {
        const { isR2Available } = await import("./services/r2-storage");
        if (!isR2Available()) {
          r2Status = "degraded";
        }
      } catch {
        r2Status = "degraded";
      }
      checks.push({ component: "R2 Storage", status: r2Status, latency: Date.now() - r2Start, checkedAt: toISOStringNow(now) });

      // Check DataQueue Worker
      const workerStart = Date.now();
      let workerStatus = "pass";
      try {
        const { isWorkerRunning } = await import("./job-worker");
        if (!isWorkerRunning()) {
          workerStatus = "degraded";
        }
      } catch {
        workerStatus = "fail";
      }
      checks.push({ component: "DataQueue Worker", status: workerStatus, latency: Date.now() - workerStart, checkedAt: toISOStringNow(now) });

      // Add integration health checks from database
      const integrations = await db.select().from(integrationHealth);
      for (const integration of integrations) {
        checks.push({
          component: integration.integrationName,
          status: integration.status === "healthy" ? "pass" : integration.status === "degraded" ? "degraded" : "fail",
          latency: integration.latencyP95 || 0,
          checkedAt: toISOString(integration.checkedAt),
        });
      }

      res.json({ 
        checks,
        lastUpdated: toISOStringNow(now),
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching health checks:", error);
      res.status(500).json({ error: "Failed to fetch health checks" });
    }
  });

  app.get("/api/system/api-errors", async (req: Request, res: Response) => {
    try {
      const snapshot = await metricsCollector.getLatestSnapshot("api");
      const metrics = snapshot?.metrics as Record<string, unknown> || {};

      res.json({
        requestCount15m: metrics.requestCount15m || 0,
        p95Latency: metrics.p95LatencyMs || 0,
        errorRate5xx: metrics.errorRate5xx || 0,
        errorRate4xx: metrics.errorRate4xx || 0,
        slowEndpoints: (metrics.slowEndpoints as unknown[]) || [],
        errorEndpoints: (metrics.errorEndpoints as unknown[]) || [],
        topEndpoints: (metrics.topEndpoints as unknown[]) || [],
        lastUpdated: toISOStringNow(snapshot?.collectedAt),
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching API errors:", error);
      res.status(500).json({ error: "Failed to fetch API errors" });
    }
  });

  app.get("/api/system/database", async (req: Request, res: Response) => {
    try {
      const snapshot = await metricsCollector.getLatestSnapshot("database");
      const metrics = snapshot?.metrics as Record<string, unknown> || {};

      res.json({
        p95Latency: metrics.p95LatencyMs || 0,
        p99Latency: metrics.p99LatencyMs || 0,
        poolUsed: metrics.poolUsed || 0,
        poolTotal: metrics.poolTotal || 20,
        poolSaturation: metrics.poolSaturation || 0,
        slowQueryCount: metrics.slowQueryCount || 0,
        slowQueries: (metrics.slowQueries as unknown[]) || [],
        lastUpdated: toISOStringNow(snapshot?.collectedAt),
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching database metrics:", error);
      res.status(500).json({ error: "Failed to fetch database metrics" });
    }
  });

  app.get("/api/system/jobs", async (req: Request, res: Response) => {
    try {
      const stats = await getJobStats();
      const snapshot = await metricsCollector.getLatestSnapshot("job_queue");
      const metrics = snapshot?.metrics as Record<string, unknown> || {};

      res.json({
        queuedJobs: stats.pending,
        runningJobs: stats.processing,
        failedJobs15m: metrics.failedJobs15m || 0,
        failedJobs24h: metrics.failedJobs24h || 0,
        oldestJobAge: metrics.oldestJobAge || 0,
        stuckJobCount: metrics.stuckJobCount || 0,
        successRate: stats.successRate,
        jobsByType: (metrics.jobsByType as unknown[]) || [],
        lastUpdated: toISOStringNow(snapshot?.collectedAt),
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching job metrics:", error);
      res.status(500).json({ error: "Failed to fetch job metrics" });
    }
  });

  app.get("/api/system/cache", async (req: Request, res: Response) => {
    try {
      const redisSnapshot = await metricsCollector.getLatestSnapshot("redis");
      const r2Snapshot = await metricsCollector.getLatestSnapshot("r2");

      const redisMetrics = redisSnapshot?.metrics as Record<string, unknown> || {};
      const r2Metrics = r2Snapshot?.metrics as Record<string, unknown> || {};

      const latestCacheUpdate = redisSnapshot?.collectedAt && r2Snapshot?.collectedAt
        ? (redisSnapshot.collectedAt > r2Snapshot.collectedAt ? redisSnapshot.collectedAt : r2Snapshot.collectedAt)
        : (redisSnapshot?.collectedAt || r2Snapshot?.collectedAt || new Date());
      
      // Get storage metrics from the metrics collector (collected periodically, not on-demand)
      const storageSnapshot = await metricsCollector.getLatestSnapshot("storage");
      const storageMetrics = storageSnapshot?.metrics as Record<string, unknown> || {};
      const storage = storageMetrics.usedMB !== undefined ? {
        usedMB: storageMetrics.usedMB as number,
        totalMB: storageMetrics.totalMB as number,
        usagePercent: storageMetrics.usagePercent as number,
      } : null;

      res.json({
        redis: {
          p95Latency: redisMetrics.p95LatencyMs || 0,
          cacheHitRate: redisMetrics.cacheHitRate || 0,
          rateLimitRejections: redisMetrics.rateLimitRejections || 0,
          connected: redisMetrics.connected ?? true,
          lastUpdated: toISOString(redisSnapshot?.collectedAt),
        },
        r2: {
          p95Latency: r2Metrics.p95LatencyMs || 0,
          uploadErrors: r2Metrics.uploadErrors || 0,
          downloadErrors: r2Metrics.downloadErrors || 0,
          lastExportFile: r2Metrics.lastExportFile || null,
          lastExportTime: r2Metrics.lastExportTime ? toISOString(r2Metrics.lastExportTime as Date) : null,
          lastUpdated: toISOString(r2Snapshot?.collectedAt),
        },
        storage,
        lastUpdated: toISOStringNow(latestCacheUpdate),
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching cache metrics:", error);
      res.status(500).json({ error: "Failed to fetch cache metrics" });
    }
  });

  app.get("/api/system/integrations", async (req: Request, res: Response) => {
    try {
      const integrations = await db.select().from(integrationHealth);

      const latestCheckedAt = integrations.reduce((latest, i) => 
        i.checkedAt && (!latest || i.checkedAt > latest) ? i.checkedAt : latest, 
        null as Date | null
      );
      res.json({
        integrations: integrations.map(i => ({
          name: i.integrationName,
          status: i.status,
          latencyP95: i.latencyP95 || 0,
          errorRate: parseFloat(i.errorRate?.toString() || "0"),
          lastSuccessAt: i.lastSuccessAt ? toISOString(i.lastSuccessAt) : null,
          lastFailureAt: i.lastFailureAt ? toISOString(i.lastFailureAt) : null,
          lastFailureReason: i.lastFailureReason,
          checkedAt: i.checkedAt ? toISOString(i.checkedAt) : null,
        })),
        lastUpdated: toISOStringNow(latestCheckedAt),
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.get("/api/system/portals", async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const latestMetrics = await db
        .select()
        .from(portalMetrics)
        .where(gte(portalMetrics.collectedAt, oneHourAgo))
        .orderBy(desc(portalMetrics.collectedAt))
        .limit(30);

      const portalMap = new Map<string, typeof latestMetrics[0]>();
      for (const m of latestMetrics) {
        if (!portalMap.has(m.portalType)) {
          portalMap.set(m.portalType, m);
        }
      }

      const portals = ["super_admin", "customer", "marketing"].map(type => {
        const metric = portalMap.get(type);
        return {
          type,
          routeTransitionP95: metric?.routeTransitionP95 || 0,
          routeTransitionP99: metric?.routeTransitionP99 || 0,
          jsErrorCount: metric?.jsErrorCount || 0,
          assetLoadFailures: metric?.assetLoadFailures || 0,
          healthStatus: metric?.healthStatus || "healthy",
          lastUpdated: toISOString(metric?.collectedAt),
        };
      });

      const latestPortalUpdate = portals.reduce((latest, p) => 
        (p.lastUpdated && p.lastUpdated > latest) ? p.lastUpdated : latest,
        portals[0]?.lastUpdated || toISOStringNow(new Date())
      );
      res.json({ 
        portals,
        lastUpdated: latestPortalUpdate,
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching portal metrics:", error);
      res.status(500).json({ error: "Failed to fetch portal metrics" });
    }
  });

  app.get("/api/system/alerts", async (req: Request, res: Response) => {
    try {
      const status = (req.query.status as string) || undefined;

      let alerts;
      if (status === "active") {
        alerts = await alertEvaluator.getActiveAlerts();
      } else {
        alerts = await db
          .select()
          .from(systemAlerts)
          .orderBy(desc(systemAlerts.firstSeenAt))
          .limit(100);
      }

      const stats = await alertEvaluator.getAlertStats();

      // Serialize all alert timestamps to ISO strings
      const serializedAlerts = alerts.map(a => ({
        ...a,
        firstSeenAt: toISOString(a.firstSeenAt),
        lastSeenAt: toISOString(a.lastSeenAt),
        acknowledgedAt: a.acknowledgedAt ? toISOString(a.acknowledgedAt) : null,
        resolvedAt: a.resolvedAt ? toISOString(a.resolvedAt) : null,
        snoozedUntil: a.snoozedUntil ? toISOString(a.snoozedUntil) : null,
      }));

      res.json({ 
        alerts: serializedAlerts, 
        stats,
        lastUpdated: toISOStringNow(new Date()),
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/system/alerts/:id/acknowledge", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as unknown as { user?: { id: string } }).user?.id || "system";

      const success = await alertEvaluator.acknowledgeAlert(id, userId);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Failed to acknowledge alert" });
      }
    } catch (error) {
      console.error("[SystemStatus] Error acknowledging alert:", error);
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });

  app.post("/api/system/alerts/:id/snooze", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { minutes = 60 } = req.body;

      const success = await alertEvaluator.snoozeAlert(id, minutes);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Failed to snooze alert" });
      }
    } catch (error) {
      console.error("[SystemStatus] Error snoozing alert:", error);
      res.status(500).json({ error: "Failed to snooze alert" });
    }
  });

  app.post("/api/system/alerts/acknowledge-all", async (req: Request, res: Response) => {
    try {
      const userId = (req as unknown as { user?: { id: string } }).user?.id || "system";
      const activeAlerts = await alertEvaluator.getActiveAlerts();

      let acknowledged = 0;
      for (const alert of activeAlerts) {
        if (await alertEvaluator.acknowledgeAlert(alert.id, userId)) {
          acknowledged++;
        }
      }

      res.json({ acknowledged });
    } catch (error) {
      console.error("[SystemStatus] Error acknowledging all alerts:", error);
      res.status(500).json({ error: "Failed to acknowledge all alerts" });
    }
  });

  app.get("/api/system/audit", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      const records = await db
        .select()
        .from(auditRecords)
        .orderBy(desc(auditRecords.occurredAt))
        .limit(limit);

      // Serialize timestamps
      const serializedRecords = records.map(r => ({
        ...r,
        occurredAt: toISOString(r.occurredAt),
      }));

      res.json({ 
        records: serializedRecords,
        lastUpdated: toISOStringNow(new Date()),
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching audit records:", error);
      res.status(500).json({ error: "Failed to fetch audit records" });
    }
  });

  app.get("/api/system/modules", async (req: Request, res: Response) => {
    try {
      const modules = await db.select().from(moduleRegistry);
      
      // Serialize timestamps
      const serializedModules = modules.map(m => ({
        ...m,
        lastExportTime: m.lastExportTime ? toISOString(m.lastExportTime) : null,
      }));

      res.json({ 
        modules: serializedModules,
        lastUpdated: toISOStringNow(new Date()),
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching modules:", error);
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  app.get("/api/system/alert-badge", async (req: Request, res: Response) => {
    try {
      const stats = await alertEvaluator.getAlertStats();
      const total = stats.criticalCount + stats.warningCount;

      res.json({
        count: total,
        hasCritical: stats.criticalCount > 0,
        status: stats.criticalCount > 0 ? "critical" : stats.warningCount > 0 ? "warning" : "healthy",
      });
    } catch (error) {
      console.error("[SystemStatus] Error fetching alert badge:", error);
      res.status(500).json({ error: "Failed to fetch alert badge" });
    }
  });

  app.post("/api/system/health-check", async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();

      const dbStart = Date.now();
      await db.execute(sql`SELECT 1`);
      const dbLatency = Date.now() - dbStart;

      res.json({
        status: "healthy",
        timestamp: new Date(),
        checks: {
          database: { status: "pass", latency: dbLatency },
          api: { status: "pass", latency: Date.now() - startTime },
        },
      });
    } catch (error) {
      console.error("[SystemStatus] Health check failed:", error);
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date(),
        error: "Health check failed",
      });
    }
  });

  console.log("[SystemStatus] API routes registered");
}
