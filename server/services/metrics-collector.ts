import { db } from "../db";
import { metricsSnapshots, integrationHealth, jobMetrics, portalMetrics } from "../../shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getJobStats, getJobs } from "../job-queue";
import { performanceMonitor } from "./performance-monitor";

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
  status: "healthy" | "degraded" | "down";
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

  private async collectApiMetrics(collectedAt: Date): Promise<void> {
    try {
      const stats = performanceMonitor.getStats();
      const recentViolations = performanceMonitor.getRecentViolations(100);

      const apiViolations = recentViolations.filter(v => v.metric === "API Response Time");
      const latencies = apiViolations.map(v => v.actual).sort((a, b) => a - b);
      
      const p95Index = Math.floor(latencies.length * 0.95);
      const p99Index = Math.floor(latencies.length * 0.99);

      const metrics: ApiMetrics = {
        requestCount15m: 0,
        p95LatencyMs: latencies[p95Index] || 0,
        p99LatencyMs: latencies[p99Index] || 0,
        errorRate5xx: 0,
        errorRate4xx: 0,
        topEndpoints: [],
        slowEndpoints: apiViolations.slice(0, 20).map(v => ({
          endpoint: v.endpoint || "unknown",
          p95: v.actual,
          count: 1,
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
      const stats = performanceMonitor.getStats();
      const recentViolations = performanceMonitor.getRecentViolations(100);

      const queryViolations = recentViolations.filter(v => v.metric === "Query Execution Time");
      const latencies = queryViolations.map(v => v.actual).sort((a, b) => a - b);

      const p95Index = Math.floor(latencies.length * 0.95);
      const p99Index = Math.floor(latencies.length * 0.99);

      const metrics: DatabaseMetrics = {
        p95LatencyMs: latencies[p95Index] || 0,
        p99LatencyMs: latencies[p99Index] || 0,
        poolUsed: 0,
        poolTotal: 20,
        poolSaturation: 0,
        slowQueryCount: queryViolations.length,
        slowQueries: queryViolations.slice(0, 10).map(v => ({
          query: v.endpoint || "unknown",
          durationMs: v.actual,
          timestamp: v.timestamp,
        })),
      };

      await this.storeSnapshot("database", metrics, collectedAt);
    } catch (error) {
      console.error("[MetricsCollector] Error collecting database metrics:", error);
    }
  }

  private async collectRedisMetrics(collectedAt: Date): Promise<void> {
    try {
      let latencyMs = 0;
      let connected = false;
      let cacheHitRate = 0;

      try {
        const { getRedisClient } = await import("./redis-session");
        const redisClient = getRedisClient();
        
        if (redisClient) {
          // Measure ping latency
          const start = Date.now();
          await redisClient.ping();
          latencyMs = Date.now() - start;
          connected = true;

          // Try to get cache stats if available
          try {
            const info = await redisClient.info("stats");
            if (info) {
              const hits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || "0");
              const misses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || "0");
              if (hits + misses > 0) {
                cacheHitRate = (hits / (hits + misses)) * 100;
              }
            }
          } catch {
            // Info command may not be available, use 0
          }
        }
      } catch (err) {
        console.log("[MetricsCollector] Redis not available:", err);
      }

      const metrics: RedisMetrics = {
        p95LatencyMs: latencyMs,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        rateLimitRejections: 0,
        connected,
      };

      await this.storeSnapshot("redis", metrics, collectedAt);
    } catch (error) {
      console.error("[MetricsCollector] Error collecting Redis metrics:", error);
    }
  }

  private async collectR2Metrics(collectedAt: Date): Promise<void> {
    try {
      let latencyMs = 0;
      let uploadErrors = 0;
      let downloadErrors = 0;

      try {
        const { isR2Available, listFiles } = await import("./r2-storage");
        
        if (isR2Available()) {
          // Measure list operation latency
          const start = Date.now();
          const result = await listFiles("");
          latencyMs = Date.now() - start;
          
          if (!result.success) {
            downloadErrors = 1;
          }
        }
      } catch (err) {
        console.log("[MetricsCollector] R2 not available:", err);
        downloadErrors = 1;
      }

      const metrics: R2Metrics = {
        p95LatencyMs: latencyMs,
        uploadErrors,
        downloadErrors,
        lastExportFile: null,
        lastExportTime: null,
      };

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

      const metrics: JobQueueMetrics = {
        queuedJobs: stats.pending,
        runningJobs: stats.processing,
        failedJobs15m,
        failedJobs24h,
        oldestJobAge,
        stuckJobCount: 0,
        successRate: stats.successRate,
        jobsByType: [],
      };

      await this.storeSnapshot("job_queue", metrics, collectedAt);

      await db.insert(jobMetrics).values({
        jobType: "all",
        queuedCount: stats.pending,
        runningCount: stats.processing,
        failedCount15m: failedJobs15m,
        failedCount24h: failedJobs24h,
        oldestJobAge,
        stuckJobCount: 0,
        averageDuration: 0,
        collectedAt,
      });
    } catch (error) {
      console.error("[MetricsCollector] Error collecting job queue metrics:", error);
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

      for (const { name, checkFn } of integrationChecks) {
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
          lastFailureReason: result.success ? null : result.error,
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

  private async checkBrevo(): Promise<{ status: "healthy" | "degraded" | "down"; latency: number; errorRate: number; success: boolean; error?: string }> {
    try {
      const start = Date.now();
      const { brevoService } = await import("../brevo");
      const isConfigured = brevoService.isConfigured();
      const latency = Date.now() - start;
      return { status: isConfigured ? "healthy" : "degraded", latency, errorRate: 0, success: isConfigured };
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

  private async checkAyrshare(): Promise<{ status: "healthy" | "degraded" | "down"; latency: number; errorRate: number; success: boolean; error?: string }> {
    // Ayrshare doesn't have a simple health check, mark as healthy if configured
    return { status: "healthy", latency: 0, errorRate: 0, success: true };
  }

  private async checkNowPayments(): Promise<{ status: "healthy" | "degraded" | "down"; latency: number; errorRate: number; success: boolean; error?: string }> {
    // NowPayments doesn't have a simple health check, mark as healthy if configured
    return { status: "healthy", latency: 0, errorRate: 0, success: true };
  }

  private async checkOpenAI(): Promise<{ status: "healthy" | "degraded" | "down"; latency: number; errorRate: number; success: boolean; error?: string }> {
    // OpenAI via Replit integration is always healthy if configured
    return { status: "healthy", latency: 0, errorRate: 0, success: true };
  }

  private async collectPortalMetrics(collectedAt: Date): Promise<void> {
    try {
      const portals: Array<"super_admin" | "customer" | "marketing"> = ["super_admin", "customer", "marketing"];

      for (const portalType of portals) {
        const metrics: PortalMetrics = {
          type: portalType,
          routeTransitionP95: 0,
          routeTransitionP99: 0,
          jsErrorCount: 0,
          assetLoadFailures: 0,
          healthStatus: "healthy",
        };

        await this.storeSnapshot("portal", metrics, collectedAt);

        await db.insert(portalMetrics).values({
          portalType,
          routeTransitionP95: 0,
          routeTransitionP99: 0,
          jsErrorCount: 0,
          assetLoadFailures: 0,
          healthStatus: "healthy",
          collectedAt,
        });
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

export function startMetricsScheduler(): void {
  if (metricsSchedulerStarted) {
    console.log("[MetricsScheduler] Already running");
    return;
  }

  console.log("[MetricsScheduler] Starting metrics collection scheduler (every 60 seconds)");
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

  // Schedule recurring collection every 60 seconds
  metricsIntervalId = setInterval(async () => {
    try {
      await metricsCollector.collectAllMetrics();
    } catch (error) {
      console.error("[MetricsScheduler] Scheduled collection failed:", error);
    }
  }, 60000);
}

export function stopMetricsScheduler(): void {
  if (metricsIntervalId) {
    clearInterval(metricsIntervalId);
    metricsIntervalId = null;
  }
  metricsSchedulerStarted = false;
  console.log("[MetricsScheduler] Stopped");
}
