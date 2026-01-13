import { db } from "../db";
import { metricsSnapshots, integrationHealth, jobMetrics, portalMetrics } from "../../shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getJobStats, getJobs } from "../job-queue";
import { performanceMonitor } from "./performance-monitor";

export type MetricsSnapshotType = "api" | "database" | "redis" | "r2" | "job_queue" | "integration" | "portal";

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
      const metrics: RedisMetrics = {
        p95LatencyMs: 0,
        cacheHitRate: 0,
        rateLimitRejections: 0,
        connected: true,
      };

      await this.storeSnapshot("redis", metrics, collectedAt);
    } catch (error) {
      console.error("[MetricsCollector] Error collecting Redis metrics:", error);
    }
  }

  private async collectR2Metrics(collectedAt: Date): Promise<void> {
    try {
      const metrics: R2Metrics = {
        p95LatencyMs: 0,
        uploadErrors: 0,
        downloadErrors: 0,
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
      const integrations = await db.select().from(integrationHealth);

      for (const integration of integrations) {
        const metrics: IntegrationMetrics = {
          name: integration.integrationName,
          status: integration.status as "healthy" | "degraded" | "down",
          latencyP95: integration.latencyP95 || 0,
          errorRate: parseFloat(integration.errorRate?.toString() || "0"),
          lastSuccessAt: integration.lastSuccessAt,
          lastFailureAt: integration.lastFailureAt,
          lastFailureReason: integration.lastFailureReason,
        };

        await this.storeSnapshot("integration", metrics, collectedAt);
      }
    } catch (error) {
      console.error("[MetricsCollector] Error collecting integration metrics:", error);
    }
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

  // Run immediately on startup
  setTimeout(async () => {
    try {
      await metricsCollector.collectAllMetrics();
    } catch (error) {
      console.error("[MetricsScheduler] Initial collection failed:", error);
    }
  }, 5000); // Wait 5 seconds for services to stabilize

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
