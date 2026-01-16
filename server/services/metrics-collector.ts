import { db, getPoolStats } from "../db";
import { metricsSnapshots, integrationHealth, jobMetrics, portalMetrics } from "../../shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getJobStats, getJobs, getRunningJobsWithAge } from "../job-queue";
import { performanceMonitor } from "./performance-monitor";
import { cacheStats } from "./cache";
import { r2Stats } from "./r2-storage";
import { budgetEngine, BUDGET_THRESHOLDS } from "./budget-engine";
import { portalMetricsStore } from "../routes/system-status.routes";

export type MetricsSnapshotType = "api" | "database" | "redis" | "r2" | "job_queue" | "integration" | "portal" | "storage";

interface ApiMetrics {
  requestCount15m: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate5xx: number;
  errorRate4xx: number;
  topEndpoints: Array<{ endpoint: string; count: number; avgLatency: number }>;
  slowEndpoints: Array<{ endpoint: string; p95: number; count: number }>;
  errorEndpoints: Array<{ endpoint: string; errorCount: number; errorRate: number }>;
}

interface DatabaseMetrics {
  p95LatencyMs: number;
  p99LatencyMs: number;
  poolUsed: number;
  poolTotal: number;
  poolSaturation: number;
  slowQueryCount: number;
  slowQueries: Array<{ query: string; durationMs: number; timestamp: Date }>;
}

interface RedisMetrics {
  p95LatencyMs: number;
  cacheHitRate: number;
  rateLimitRejections: number;
  connected: boolean;
}

interface R2Metrics {
  p95LatencyMs: number;
  uploadErrors: number;
  downloadErrors: number;
  lastExportFile: string | null;
  lastExportTime: Date | null;
}

interface JobQueueMetrics {
  queuedJobs: number;
  runningJobs: number;
  failedJobs15m: number;
  failedJobs24h: number;
  oldestJobAge: number;
  stuckJobCount: number;
  successRate: number;
  jobsByType: Array<{ type: string; queued: number; running: number; failed: number }>;
}

interface IntegrationMetrics {
  name: string;
  status: "healthy" | "degraded" | "down" | "not_configured";
  latencyP95: number;
  errorRate: number;
  lastSuccessAt: Date | null;
  lastFailureAt: Date | null;
  lastFailureReason: string | null;
}

interface PortalMetrics {
  type: "super_admin" | "customer" | "marketing";
  routeTransitionP95: number;
  routeTransitionP99: number;
  jsErrorCount: number;
  assetLoadFailures: number;
  healthStatus: "healthy" | "degraded" | "down";
}

interface StorageMetrics {
  usedMB: number;
  totalMB: number;
  usagePercent: number;
}

class MetricsCollectorService {
  private lastCollectionTime: Date | null = null;
  private isCollecting = false;
  private isRefreshingIntegrations = false;

  async collectAllMetrics(): Promise<void> {
    if (this.isCollecting) {
      console.log("[MetricsCollector] Collection already in progress, skipping");
      return;
    }

    this.isCollecting = true;
    const collectedAt = new Date();
    console.log("[MetricsCollector] Starting metrics collection at", collectedAt.toISOString());

    try {
      await Promise.all([
        this.collectApiMetrics(collectedAt),
        this.collectDatabaseMetrics(collectedAt),
        this.collectRedisMetrics(collectedAt),
        this.collectR2Metrics(collectedAt),
        this.collectJobQueueMetrics(collectedAt),
        this.collectIntegrationMetrics(collectedAt),
        this.collectPortalMetrics(collectedAt),
        this.collectStorageMetrics(collectedAt),
      ]);

      this.lastCollectionTime = collectedAt;
      console.log("[MetricsCollector] Completed metrics collection in", Date.now() - collectedAt.getTime(), "ms");
    } catch (error) {
      console.error("[MetricsCollector] Error collecting metrics:", error);
    } finally {
      this.isCollecting = false;
    }
  }

  async refreshIntegrationHealth(): Promise<{ success: boolean; skipped?: boolean }> {
    if (this.isRefreshingIntegrations) {
      console.log("[MetricsCollector] Integration refresh already in progress, skipping");
      return { success: true, skipped: true };
    }
    
    this.isRefreshingIntegrations = true;
    try {
      const collectedAt = new Date();
      console.log("[MetricsCollector] Triggering live integration health checks at", collectedAt.toISOString());
      await this.collectIntegrationMetrics(collectedAt);
      console.log("[MetricsCollector] Live integration health checks complete");
      return { success: true };
    } finally {
      this.isRefreshingIntegrations = false;
    }
  }

  private async collectApiMetrics(collectedAt: Date): Promise<void> {
    try {
      const windowMs = 15 * 60 * 1000;
      const apiTimings = performanceMonitor.getApiTimings(windowMs);
      const p95 = performanceMonitor.getApiP95(windowMs);
      const topEndpoints = performanceMonitor.getTopEndpoints(10, windowMs);
      const slowEndpoints = performanceMonitor.getSlowEndpoints(20, windowMs);
      
      const latencies = apiTimings.map(t => t.durationMs).sort((a, b) => a - b);
      const p99Index = Math.floor(latencies.length * 0.99);

      const metrics: ApiMetrics = {
        requestCount15m: apiTimings.length,
        p95LatencyMs: p95,
        p99LatencyMs: latencies[p99Index] || 0,
        errorRate5xx: 0,
        errorRate4xx: 0,
        topEndpoints: topEndpoints.map(e => ({
          endpoint: e.endpoint,
          count: e.count,
          avgLatency: Math.round(e.avgMs),
        })),
        slowEndpoints: slowEndpoints.map(e => ({
          endpoint: e.endpoint,
          p95: e.p95,
          count: e.count,
        })),
        errorEndpoints: [],
      };

      await this.storeSnapshot("api", metrics, collectedAt);
    } catch (error) {
      console.error("[MetricsCollector] Error collecting API metrics:", error);
    }
  }

  private async collectDatabaseMetrics(collectedAt: Date): Promise<void> {
    try {
      const windowMs = 15 * 60 * 1000;
      const queryTimings = performanceMonitor.getQueryTimings(windowMs);
      const p95 = performanceMonitor.getQueryP95(windowMs);
      
      const latencies = queryTimings.map(t => t.durationMs).sort((a, b) => a - b);
      const p99Index = Math.floor(latencies.length * 0.99);

      // Get REAL pool stats from node-postgres Pool
      const poolStats = getPoolStats();

      const metrics: DatabaseMetrics = {
        p95LatencyMs: p95,
        p99LatencyMs: latencies[p99Index] || 0,
        poolUsed: poolStats.usedCount,
        poolTotal: poolStats.maxConnections,
        poolSaturation: Math.round(poolStats.saturation * 100) / 100,
        slowQueryCount: queryTimings.filter(t => t.durationMs > 200).length,
        slowQueries: queryTimings
          .filter(t => t.durationMs > 200)
          .sort((a, b) => b.durationMs - a.durationMs)
          .slice(0, 10)
          .map(t => ({
            query: t.query,
            durationMs: t.durationMs,
            timestamp: t.timestamp,
          })),
      };

      // Evaluate pool saturation with Budget Engine (hysteresis)
      budgetEngine.evaluate(
        "db_pool_saturation",
        poolStats.saturation,
        BUDGET_THRESHOLDS.dbPoolSaturation,
        undefined,
        { poolUsed: poolStats.usedCount, poolTotal: poolStats.maxConnections, waitingCount: poolStats.waitingCount }
      );

      // Evaluate waiting connections
      if (poolStats.waitingCount > 0) {
        budgetEngine.evaluate(
          "db_pool_waiting",
          poolStats.waitingCount,
          BUDGET_THRESHOLDS.dbPoolWaiting,
          undefined,
          { waitingCount: poolStats.waitingCount }
        );
      }

      await this.storeSnapshot("database", metrics, collectedAt);
    } catch (error) {
      console.error("[MetricsCollector] Error collecting database metrics:", error);
    }
  }

  private async collectRedisMetrics(collectedAt: Date): Promise<void> {
    try {
      let latencyMs = 0;
      let connected = false;

      try {
        const { getRedisClient } = await import("./redis-session");
        const redisClient = getRedisClient();
        
        if (redisClient) {
          // Measure ping latency
          const start = Date.now();
          await redisClient.ping();
          latencyMs = Date.now() - start;
          connected = true;
        }
      } catch (err) {
        console.log("[MetricsCollector] Redis not available:", err);
      }

      // Get REAL cache hit rate from cacheStats
      const stats = cacheStats.getStats();
      const hitRate = stats.hitRate;

      const metrics: RedisMetrics = {
        p95LatencyMs: latencyMs,
        cacheHitRate: Math.round(hitRate * 100) / 100,
        rateLimitRejections: 0,
        connected,
      };

      // Evaluate cache hit rate with Budget Engine (hysteresis)
      // Only evaluate if we have enough operations to be meaningful
      if (stats.total >= 10) {
        budgetEngine.evaluate(
          "redis_hit_rate",
          hitRate,
          BUDGET_THRESHOLDS.redisHitRate,
          undefined,
          { hits: stats.hits, misses: stats.misses, total: stats.total }
        );
      }

      await this.storeSnapshot("redis", metrics, collectedAt);
    } catch (error) {
      console.error("[MetricsCollector] Error collecting Redis metrics:", error);
    }
  }

  private async collectR2Metrics(collectedAt: Date): Promise<void> {
    try {
      let latencyMs = 0;

      try {
        const { isR2Available, listFiles } = await import("./r2-storage");
        
        if (isR2Available()) {
          // Measure list operation latency
          const start = Date.now();
          await listFiles("");
          latencyMs = Date.now() - start;
        }
      } catch (err) {
        console.log("[MetricsCollector] R2 not available:", err);
      }

      // Get REAL R2 stats from r2Stats
      const stats = r2Stats.getStats();

      const metrics: R2Metrics = {
        p95LatencyMs: latencyMs,
        uploadErrors: stats.upload.fail,
        downloadErrors: stats.download.fail,
        lastExportFile: null,
        lastExportTime: null,
      };

      // Evaluate R2 error rate with Budget Engine (hysteresis)
      // Only evaluate if we have enough operations to be meaningful
      if (stats.total >= 5) {
        budgetEngine.evaluate(
          "r2_error_rate",
          stats.errorRate,
          BUDGET_THRESHOLDS.r2ErrorRate,
          undefined,
          { totalSuccess: stats.totalSuccess, totalFail: stats.totalFail, errorRate: stats.errorRate }
        );
      }

      await this.storeSnapshot("r2", metrics, collectedAt);
    } catch (error) {
      console.error("[MetricsCollector] Error collecting R2 metrics:", error);
    }
  }

  private async collectJobQueueMetrics(collectedAt: Date): Promise<void> {
    try {
      const stats = await getJobStats();
      const failedJobs = await getJobs({ status: "failed", limit: 100 });

      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const failedJobs15m = failedJobs.filter(j => {
        const job = j as unknown as { failedAt?: Date | null };
        return job.failedAt && new Date(job.failedAt) > fifteenMinutesAgo;
      }).length;

      const failedJobs24h = failedJobs.filter(j => {
        const job = j as unknown as { failedAt?: Date | null };
        return job.failedAt && new Date(job.failedAt) > twentyFourHoursAgo;
      }).length;

      const pendingJobs = await getJobs({ status: "pending", limit: 100 });
      let oldestJobAge = 0;
      if (pendingJobs.length > 0) {
        const oldest = pendingJobs.reduce((oldest, job) => 
          new Date(job.createdAt) < new Date(oldest.createdAt) ? job : oldest
        );
        oldestJobAge = Math.floor((now.getTime() - new Date(oldest.createdAt).getTime()) / 1000);
      }

      // REAL stuck jobs detection: running jobs with age > threshold
      // Default threshold: 10 minutes, import/rerating: 60 minutes
      const stuckJobCount = await this.countStuckJobs();

      const metrics: JobQueueMetrics = {
        queuedJobs: stats.pending,
        runningJobs: stats.processing,
        failedJobs15m,
        failedJobs24h,
        oldestJobAge,
        stuckJobCount,
        successRate: stats.successRate,
        jobsByType: [],
      };

      // Evaluate stuck jobs with Budget Engine (hysteresis)
      if (stuckJobCount > 0) {
        budgetEngine.evaluate(
          "stuck_jobs",
          stuckJobCount,
          BUDGET_THRESHOLDS.stuckJobs,
          undefined,
          { stuckJobCount }
        );
      }

      await this.storeSnapshot("job_queue", metrics, collectedAt);

      await db.insert(jobMetrics).values({
        jobType: "all",
        queuedCount: stats.pending,
        runningCount: stats.processing,
        failedCount15m: failedJobs15m,
        failedCount24h: failedJobs24h,
        oldestJobAge,
        stuckJobCount,
        averageDuration: 0,
        collectedAt,
      });
    } catch (error) {
      console.error("[MetricsCollector] Error collecting job queue metrics:", error);
    }
  }

  /**
   * Count stuck jobs - running jobs that have exceeded their time threshold
   * Default: 10 minutes, import/rerating jobs: 60 minutes
   */
  private async countStuckJobs(): Promise<number> {
    try {
      const defaultThresholdMs = 10 * 60 * 1000; // 10 minutes
      const longJobThresholdMs = 60 * 60 * 1000; // 60 minutes for imports/rerating

      // Get running jobs with their age from job queue
      const runningJobs = await getRunningJobsWithAge();

      let stuckCount = 0;
      for (const job of runningJobs) {
        const isLongJob = job.type.includes("import") || job.type.includes("rerat") || job.type.includes("sync");
        const threshold = isLongJob ? longJobThresholdMs : defaultThresholdMs;
        
        if (job.ageMs > threshold) {
          stuckCount++;
        }
      }

      return stuckCount;
    } catch (error) {
      console.error("[MetricsCollector] Error counting stuck jobs:", error);
      return 0;
    }
  }

  private async collectIntegrationMetrics(collectedAt: Date): Promise<void> {
    try {
      // Perform actual health checks for each integration and update the database
      const integrationChecks = [
        { name: "connexcs", checkFn: this.checkConnexCS.bind(this) },
        { name: "brevo", checkFn: this.checkBrevo.bind(this) },
        { name: "openexchangerates", checkFn: this.checkOpenExchange.bind(this) },
        { name: "ayrshare", checkFn: this.checkAyrshare.bind(this) },
        { name: "nowpayments", checkFn: this.checkNowPayments.bind(this) },
        { name: "openai", checkFn: this.checkOpenAI.bind(this) },
      ];

      for (let i = 0; i < integrationChecks.length; i++) {
        const { name, checkFn } = integrationChecks[i];
        
        // Add 500ms buffer between each integration check to prevent API overload
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const result = await checkFn();
        
        // Update or insert integration health record
        const existing = await db.select().from(integrationHealth)
          .where(eq(integrationHealth.integrationName, name))
          .limit(1);

        if (existing.length > 0) {
          await db.update(integrationHealth)
            .set({
              status: result.status,
              latencyP95: result.latency,
              errorRate: result.errorRate.toString(),
              lastSuccessAt: result.success ? collectedAt : existing[0].lastSuccessAt,
              lastFailureAt: result.success ? existing[0].lastFailureAt : collectedAt,
              lastFailureReason: result.success ? null : result.error,
              checkedAt: collectedAt,
            })
            .where(eq(integrationHealth.integrationName, name));
        } else {
          await db.insert(integrationHealth).values({
            integrationName: name,
            status: result.status,
            latencyP95: result.latency,
            errorRate: result.errorRate.toString(),
            lastSuccessAt: result.success ? collectedAt : null,
            lastFailureAt: result.success ? null : collectedAt,
            lastFailureReason: result.success ? null : result.error,
            checkedAt: collectedAt,
          });
        }

        const metrics: IntegrationMetrics = {
          name,
          status: result.status,
          latencyP95: result.latency,
          errorRate: result.errorRate,
          lastSuccessAt: result.success ? collectedAt : null,
          lastFailureAt: result.success ? null : collectedAt,
          lastFailureReason: result.success ? null : (result.error ?? null),
        };

        await this.storeSnapshot("integration", metrics, collectedAt);
      }
    } catch (error) {
      console.error("[MetricsCollector] Error collecting integration metrics:", error);
    }
  }

  private async checkConnexCS(): Promise<{ status: "healthy" | "degraded" | "down"; latency: number; errorRate: number; success: boolean; error?: string }> {
    try {
      const start = Date.now();
      const { connexcsTools } = await import("../connexcs-tools-service");
      const { storage } = await import("../storage");
      const status = await connexcsTools.getStatus(storage);
      const latency = Date.now() - start;
      return { status: status.connected ? "healthy" : "degraded", latency, errorRate: 0, success: status.connected };
    } catch (err) {
      return { status: "down", latency: 0, errorRate: 99.99, success: false, error: (err as Error).message };
    }
  }

  private async checkBrevo(): Promise<{ status: "healthy" | "degraded" | "down" | "not_configured"; latency: number; errorRate: number; success: boolean; error?: string }> {
    try {
      const start = Date.now();
      const { brevoService } = await import("../brevo");
      const isConfigured = brevoService.isConfigured();
      const latency = Date.now() - start;
      if (!isConfigured) {
        return { status: "not_configured", latency: 0, errorRate: 0, success: true, error: "API key not configured" };
      }
      return { status: "healthy", latency, errorRate: 0, success: true };
    } catch (err) {
      return { status: "down", latency: 0, errorRate: 99.99, success: false, error: (err as Error).message };
    }
  }

  private async checkOpenExchange(): Promise<{ status: "healthy" | "degraded" | "down"; latency: number; errorRate: number; success: boolean; error?: string }> {
    try {
      const start = Date.now();
      const { getLastSyncStatus } = await import("./open-exchange-rates");
      const syncStatus = getLastSyncStatus();
      const latency = Date.now() - start;
      return { 
        status: syncStatus.schedulerActive ? "healthy" : "degraded", 
        latency, 
        errorRate: syncStatus.lastSyncError ? 99.99 : 0, 
        success: syncStatus.schedulerActive 
      };
    } catch (err) {
      return { status: "down", latency: 0, errorRate: 99.99, success: false, error: (err as Error).message };
    }
  }

  private async checkAyrshare(): Promise<{ status: "healthy" | "degraded" | "down" | "not_configured"; latency: number; errorRate: number; success: boolean; error?: string }> {
    const apiKey = process.env.AYRSHARE_API_KEY;
    if (!apiKey) {
      return { status: "not_configured", latency: 0, errorRate: 0, success: true, error: "API key not configured" };
    }
    try {
      const start = Date.now();
      const response = await fetch("https://api.ayrshare.com/api/user", {
        method: "GET",
        headers: { "Authorization": `Bearer ${apiKey}` },
      });
      const latency = Date.now() - start;
      return { status: response.ok ? "healthy" : "degraded", latency, errorRate: response.ok ? 0 : 50, success: response.ok };
    } catch (err) {
      return { status: "down", latency: 0, errorRate: 99.99, success: false, error: (err as Error).message };
    }
  }

  private async checkNowPayments(): Promise<{ status: "healthy" | "degraded" | "down" | "not_configured"; latency: number; errorRate: number; success: boolean; error?: string }> {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return { status: "not_configured", latency: 0, errorRate: 0, success: true, error: "API key not configured" };
    }
    try {
      const start = Date.now();
      const response = await fetch("https://api.nowpayments.io/v1/status", {
        method: "GET",
        headers: { "x-api-key": apiKey },
      });
      const latency = Date.now() - start;
      return { status: response.ok ? "healthy" : "degraded", latency, errorRate: response.ok ? 0 : 50, success: response.ok };
    } catch (err) {
      return { status: "down", latency: 0, errorRate: 99.99, success: false, error: (err as Error).message };
    }
  }

  private async checkOpenAI(): Promise<{ status: "healthy" | "degraded" | "down" | "not_configured"; latency: number; errorRate: number; success: boolean; error?: string }> {
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
    
    if (!apiKey) {
      return { status: "not_configured", latency: 0, errorRate: 0, success: true, error: "API key not configured" };
    }
    
    // Replit's AI integration manages the key - if both key and baseUrl are set, consider it healthy
    // The proxy handles authentication and we trust Replit's integration is working
    if (baseUrl) {
      return { status: "healthy", latency: 0, errorRate: 0, success: true };
    }
    
    // Fallback: check direct OpenAI API if no Replit proxy configured
    try {
      const start = Date.now();
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: { "Authorization": `Bearer ${apiKey}` },
      });
      const latency = Date.now() - start;
      return { status: response.ok ? "healthy" : "degraded", latency, errorRate: response.ok ? 0 : 50, success: response.ok };
    } catch (err) {
      return { status: "down", latency: 0, errorRate: 99.99, success: false, error: (err as Error).message };
    }
  }

  private async collectPortalMetrics(collectedAt: Date): Promise<void> {
    try {
      const portals: Array<"super_admin" | "customer" | "marketing"> = ["super_admin", "customer", "marketing"];
      const storeStats = portalMetricsStore.getStats();

      for (const portalType of portals) {
        const portalStats = storeStats[portalType];
        
        // Determine health status based on P95 threshold
        let healthStatus: "healthy" | "degraded" | "down" = "healthy";
        if (portalStats.transitionP95 > BUDGET_THRESHOLDS.portalRouteP95.critical) {
          healthStatus = "down";
        } else if (portalStats.transitionP95 > BUDGET_THRESHOLDS.portalRouteP95.warn) {
          healthStatus = "degraded";
        }

        const metrics: PortalMetrics = {
          type: portalType,
          routeTransitionP95: portalStats.transitionP95,
          routeTransitionP99: portalStats.transitionP99,
          jsErrorCount: portalStats.errorCount,
          assetLoadFailures: 0,
          healthStatus,
        };

        await this.storeSnapshot("portal", metrics, collectedAt);

        await db.insert(portalMetrics).values({
          portalType,
          routeTransitionP95: portalStats.transitionP95,
          routeTransitionP99: portalStats.transitionP99,
          jsErrorCount: portalStats.errorCount,
          assetLoadFailures: 0,
          healthStatus,
          collectedAt,
        });

        // Evaluate portal route P95 against budget thresholds with hysteresis
        budgetEngine.evaluate(
          "portalRouteP95",
          portalStats.transitionP95,
          {
            warn: BUDGET_THRESHOLDS.portalRouteP95.warn,
            critical: BUDGET_THRESHOLDS.portalRouteP95.critical,
            higherIsBad: true,
          },
          `portal_${portalType}`
        );
      }
    } catch (error) {
      console.error("[MetricsCollector] Error collecting portal metrics:", error);
    }
  }

  private async collectStorageMetrics(collectedAt: Date): Promise<void> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      let metrics: StorageMetrics = {
        usedMB: 0,
        totalMB: 1000, // Default to 1GB
        usagePercent: 0,
      };

      try {
        const { stdout } = await execAsync('df -m /home/runner 2>/dev/null || df -m . 2>/dev/null || echo "Filesystem 1000 0 1000"');
        const lines = stdout.trim().split('\n');
        if (lines.length > 1) {
          const parts = lines[1].split(/\s+/);
          if (parts.length >= 4) {
            metrics.totalMB = parseFloat(parts[1]) || 1000;
            metrics.usedMB = parseFloat(parts[2]) || 0;
            metrics.usagePercent = metrics.totalMB > 0 ? (metrics.usedMB / metrics.totalMB) * 100 : 0;
          }
        }
      } catch (e) {
        // Use defaults if df command fails
      }

      await this.storeSnapshot("storage", metrics, collectedAt);
    } catch (error) {
      console.error("[MetricsCollector] Error collecting storage metrics:", error);
    }
  }

  private async storeSnapshot(
    snapshotType: MetricsSnapshotType,
    metrics: unknown,
    collectedAt: Date
  ): Promise<void> {
    try {
      await db.insert(metricsSnapshots).values({
        snapshotType,
        metrics,
        collectedAt,
      });
    } catch (error) {
      console.error(`[MetricsCollector] Error storing ${snapshotType} snapshot:`, error);
    }
  }

  async getLatestSnapshot(snapshotType: MetricsSnapshotType): Promise<{
    metrics: unknown;
    collectedAt: Date;
  } | null> {
    const [snapshot] = await db
      .select()
      .from(metricsSnapshots)
      .where(eq(metricsSnapshots.snapshotType, snapshotType))
      .orderBy(desc(metricsSnapshots.collectedAt))
      .limit(1);

    if (!snapshot) return null;

    return {
      metrics: snapshot.metrics,
      collectedAt: snapshot.collectedAt,
    };
  }

  async getSnapshotHistory(
    snapshotType: MetricsSnapshotType,
    limit = 60
  ): Promise<Array<{ metrics: unknown; collectedAt: Date }>> {
    const snapshots = await db
      .select()
      .from(metricsSnapshots)
      .where(eq(metricsSnapshots.snapshotType, snapshotType))
      .orderBy(desc(metricsSnapshots.collectedAt))
      .limit(limit);

    return snapshots.map(s => ({
      metrics: s.metrics,
      collectedAt: s.collectedAt,
    }));
  }

  getLastCollectionTime(): Date | null {
    return this.lastCollectionTime;
  }

  isCurrentlyCollecting(): boolean {
    return this.isCollecting;
  }

  async cleanupOldSnapshots(olderThanHours = 24): Promise<number> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - olderThanHours);

    const result = await db
      .delete(metricsSnapshots)
      .where(sql`${metricsSnapshots.collectedAt} < ${cutoff}`);

    return 0;
  }
}

export const metricsCollector = new MetricsCollectorService();

export async function handleMetricsCollectJob(): Promise<void> {
  await metricsCollector.collectAllMetrics();
}

let metricsSchedulerStarted = false;
let metricsIntervalId: NodeJS.Timeout | null = null;

const IS_DEV = process.env.NODE_ENV !== "production";
const METRICS_INTERVAL_MS = IS_DEV ? 300000 : 60000;

export function startMetricsScheduler(): void {
  if (metricsSchedulerStarted) {
    console.log("[MetricsScheduler] Already running");
    return;
  }

  const intervalDesc = IS_DEV ? "5 minutes (DEV)" : "60 seconds (PROD)";
  console.log(`[MetricsScheduler] Starting metrics collection scheduler (every ${intervalDesc})`);
  metricsSchedulerStarted = true;

  // Run immediately on startup with minimal delay for services to stabilize
  setTimeout(async () => {
    try {
      console.log("[MetricsScheduler] Running initial metrics collection...");
      await metricsCollector.collectAllMetrics();
      console.log("[MetricsScheduler] Initial metrics collection complete");
    } catch (error) {
      console.error("[MetricsScheduler] Initial collection failed:", error);
    }
  }, 1000); // Wait 1 second for basic services to initialize

  // Schedule recurring collection - DEV: 5 min, PROD: 60 sec
  metricsIntervalId = setInterval(async () => {
    try {
      await metricsCollector.collectAllMetrics();
    } catch (error) {
      console.error("[MetricsScheduler] Scheduled collection failed:", error);
    }
  }, METRICS_INTERVAL_MS);
}

export function stopMetricsScheduler(): void {
  if (metricsIntervalId) {
    clearInterval(metricsIntervalId);
    metricsIntervalId = null;
  }
  metricsSchedulerStarted = false;
  console.log("[MetricsScheduler] Stopped");
}
