import { db } from "../db";
import { systemAlerts, metricsSnapshots, integrationHealth } from "../../shared/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { brevoService } from "../brevo";

interface PerformanceBudget {
  name: string;
  metricPath: string;
  snapshotType: "api" | "database" | "redis" | "r2" | "job_queue" | "integration" | "portal";
  warningThreshold: number;
  criticalThreshold: number;
  windowMinutes: number;
  source: string;
}

const PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  {
    name: "API List p95",
    metricPath: "p95LatencyMs",
    snapshotType: "api",
    warningThreshold: 120,
    criticalThreshold: 250,
    windowMinutes: 15,
    source: "api",
  },
  {
    name: "API 5xx Rate",
    metricPath: "errorRate5xx",
    snapshotType: "api",
    warningThreshold: 0.3,
    criticalThreshold: 1.0,
    windowMinutes: 5,
    source: "api",
  },
  {
    name: "Database Query p95",
    metricPath: "p95LatencyMs",
    snapshotType: "database",
    warningThreshold: 60,
    criticalThreshold: 150,
    windowMinutes: 15,
    source: "database",
  },
  {
    name: "Database Pool Saturation",
    metricPath: "poolSaturation",
    snapshotType: "database",
    warningThreshold: 70,
    criticalThreshold: 90,
    windowMinutes: 5,
    source: "database",
  },
  {
    name: "Redis p95",
    metricPath: "p95LatencyMs",
    snapshotType: "redis",
    warningThreshold: 30,
    criticalThreshold: 100,
    windowMinutes: 5,
    source: "redis",
  },
  {
    name: "R2 p95",
    metricPath: "p95LatencyMs",
    snapshotType: "r2",
    warningThreshold: 300,
    criticalThreshold: 1000,
    windowMinutes: 5,
    source: "r2",
  },
  {
    name: "Job Queue Stuck Jobs",
    metricPath: "stuckJobCount",
    snapshotType: "job_queue",
    warningThreshold: 1,
    criticalThreshold: 5,
    windowMinutes: 10,
    source: "job",
  },
  {
    name: "Job Queue Backlog",
    metricPath: "queuedJobs",
    snapshotType: "job_queue",
    warningThreshold: 500,
    criticalThreshold: 2000,
    windowMinutes: 15,
    source: "job",
  },
];

class AlertEvaluatorService {
  private lastEvaluationTime: Date | null = null;
  private isEvaluating = false;
  private adminEmail: string | null = null;
  private alertCooldownMs = 30 * 60 * 1000;
  private lastEmailSentAt: Map<string, Date> = new Map();

  constructor() {
    this.adminEmail = process.env.SUPER_ADMIN_EMAIL || null;
  }

  setAdminEmail(email: string) {
    this.adminEmail = email;
  }

  async evaluateAllBudgets(): Promise<void> {
    if (this.isEvaluating) {
      console.log("[AlertEvaluator] Evaluation already in progress, skipping");
      return;
    }

    this.isEvaluating = true;
    const now = new Date();
    console.log("[AlertEvaluator] Starting budget evaluation at", now.toISOString());

    try {
      for (const budget of PERFORMANCE_BUDGETS) {
        await this.evaluateBudget(budget, now);
      }

      await this.evaluateIntegrationHealth(now);
      await this.autoResolveAlerts(now);

      this.lastEvaluationTime = now;
      console.log("[AlertEvaluator] Completed budget evaluation in", Date.now() - now.getTime(), "ms");
    } catch (error) {
      console.error("[AlertEvaluator] Error evaluating budgets:", error);
    } finally {
      this.isEvaluating = false;
    }
  }

  private async evaluateBudget(budget: PerformanceBudget, now: Date): Promise<void> {
    try {
      const windowStart = new Date(now.getTime() - budget.windowMinutes * 60 * 1000);

      const snapshots = await db
        .select()
        .from(metricsSnapshots)
        .where(
          and(
            eq(metricsSnapshots.snapshotType, budget.snapshotType),
            gte(metricsSnapshots.collectedAt, windowStart)
          )
        )
        .orderBy(desc(metricsSnapshots.collectedAt))
        .limit(budget.windowMinutes);

      if (snapshots.length === 0) {
        return;
      }

      const values = snapshots
        .map(s => {
          const metrics = s.metrics as Record<string, unknown>;
          return this.extractMetricValue(metrics, budget.metricPath);
        })
        .filter(v => v !== null) as number[];

      if (values.length === 0) return;

      const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;

      let severity: "warning" | "critical" | null = null;
      let threshold = 0;

      if (avgValue >= budget.criticalThreshold) {
        severity = "critical";
        threshold = budget.criticalThreshold;
      } else if (avgValue >= budget.warningThreshold) {
        severity = "warning";
        threshold = budget.warningThreshold;
      }

      if (severity) {
        await this.createOrUpdateAlert({
          severity,
          source: budget.source,
          title: `${budget.name} Budget Breach`,
          description: `${budget.name} is ${avgValue.toFixed(2)} (threshold: ${threshold})`,
          metricName: budget.name,
          actualValue: avgValue,
          threshold,
          now,
        });
      }
    } catch (error) {
      console.error(`[AlertEvaluator] Error evaluating budget ${budget.name}:`, error);
    }
  }

  private extractMetricValue(metrics: Record<string, unknown>, path: string): number | null {
    const parts = path.split(".");
    let current: unknown = metrics;

    for (const part of parts) {
      if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return null;
      }
    }

    if (typeof current === "number") return current;
    if (typeof current === "string") {
      const parsed = parseFloat(current);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private async evaluateIntegrationHealth(now: Date): Promise<void> {
    try {
      const integrations = await db.select().from(integrationHealth);

      for (const integration of integrations) {
        if (integration.status === "down") {
          await this.createOrUpdateAlert({
            severity: "critical",
            source: "integration",
            title: `${integration.integrationName} Integration Down`,
            description: integration.lastFailureReason || "Integration is not responding",
            metricName: `${integration.integrationName}_status`,
            actualValue: 0,
            threshold: 1,
            now,
          });
        } else if (integration.status === "degraded") {
          await this.createOrUpdateAlert({
            severity: "warning",
            source: "integration",
            title: `${integration.integrationName} Integration Degraded`,
            description: `Error rate: ${integration.errorRate || 0}%, Latency: ${integration.latencyP95 || 0}ms`,
            metricName: `${integration.integrationName}_status`,
            actualValue: 0.5,
            threshold: 1,
            now,
          });
        }
      }
    } catch (error) {
      console.error("[AlertEvaluator] Error evaluating integration health:", error);
    }
  }

  private async createOrUpdateAlert(params: {
    severity: "warning" | "critical";
    source: string;
    title: string;
    description: string;
    metricName: string;
    actualValue: number;
    threshold: number;
    now: Date;
  }): Promise<void> {
    try {
      const [existingAlert] = await db
        .select()
        .from(systemAlerts)
        .where(
          and(
            eq(systemAlerts.metricName, params.metricName),
            eq(systemAlerts.status, "active")
          )
        )
        .limit(1);

      if (existingAlert) {
        const breachDuration = Math.floor(
          (params.now.getTime() - new Date(existingAlert.firstSeenAt).getTime()) / 1000
        );

        await db
          .update(systemAlerts)
          .set({
            lastSeenAt: params.now,
            actualValue: params.actualValue.toString(),
            severity: params.severity,
            breachDuration,
            updatedAt: params.now,
          })
          .where(eq(systemAlerts.id, existingAlert.id));
      } else {
        await db.insert(systemAlerts).values({
          severity: params.severity,
          source: params.source,
          title: params.title,
          description: params.description,
          metricName: params.metricName,
          actualValue: params.actualValue.toString(),
          threshold: params.threshold.toString(),
          breachDuration: 0,
          firstSeenAt: params.now,
          lastSeenAt: params.now,
          status: "active",
        });

        if (params.severity === "critical" || params.severity === "warning") {
          await this.sendAlertEmail(params);
        }
      }
    } catch (error) {
      console.error("[AlertEvaluator] Error creating/updating alert:", error);
    }
  }

  private async autoResolveAlerts(now: Date): Promise<void> {
    try {
      const staleThreshold = new Date(now.getTime() - 5 * 60 * 1000);

      await db
        .update(systemAlerts)
        .set({
          status: "resolved",
          resolvedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(systemAlerts.status, "active"),
            sql`${systemAlerts.lastSeenAt} < ${staleThreshold}`
          )
        );
    } catch (error) {
      console.error("[AlertEvaluator] Error auto-resolving alerts:", error);
    }
  }

  private async sendAlertEmail(params: {
    severity: "warning" | "critical";
    title: string;
    description: string;
    metricName: string;
    actualValue: number;
    threshold: number;
  }): Promise<void> {
    if (!this.adminEmail) return;

    const lastSent = this.lastEmailSentAt.get(params.metricName);
    if (lastSent && Date.now() - lastSent.getTime() < this.alertCooldownMs) {
      return;
    }

    try {
      const severityColor = params.severity === "critical" ? "#dc2626" : "#f59e0b";
      const severityLabel = params.severity.toUpperCase();

      const htmlContent = `
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
            <h2 style="color: ${severityColor};">[${severityLabel}] ${params.title}</h2>
            <p>${params.description}</p>
            <table style="border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Metric</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.metricName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Actual Value</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.actualValue.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Threshold</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${params.threshold}</td>
              </tr>
            </table>
            <p style="color: #6b7280; font-size: 14px;">
              Review the System Status page for details and to acknowledge this alert.
            </p>
          </body>
        </html>
      `;

      await brevoService.sendEmail({
        to: this.adminEmail,
        subject: `[DIDTron ${severityLabel}] ${params.title}`,
        htmlContent,
        tags: ["alert", params.severity],
      });

      this.lastEmailSentAt.set(params.metricName, new Date());
      console.log(`[AlertEvaluator] Alert email sent for ${params.metricName}`);
    } catch (error) {
      console.error("[AlertEvaluator] Failed to send alert email:", error);
    }
  }

  async getActiveAlerts(): Promise<typeof systemAlerts.$inferSelect[]> {
    const alerts = await db
      .select()
      .from(systemAlerts)
      .where(eq(systemAlerts.status, "active"))
      .orderBy(desc(systemAlerts.firstSeenAt));

    return alerts;
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    try {
      await db
        .update(systemAlerts)
        .set({
          status: "acknowledged",
          acknowledgedBy: userId,
          acknowledgedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(systemAlerts.id, alertId));
      return true;
    } catch (error) {
      console.error("[AlertEvaluator] Error acknowledging alert:", error);
      return false;
    }
  }

  async snoozeAlert(alertId: string, snoozeMinutes: number): Promise<boolean> {
    try {
      const snoozeUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);
      await db
        .update(systemAlerts)
        .set({
          status: "snoozed",
          snoozeUntil,
          updatedAt: new Date(),
        })
        .where(eq(systemAlerts.id, alertId));
      return true;
    } catch (error) {
      console.error("[AlertEvaluator] Error snoozing alert:", error);
      return false;
    }
  }

  async getAlertStats(): Promise<{
    criticalCount: number;
    warningCount: number;
    acknowledgedCount: number;
    snoozedCount: number;
    resolvedCount24h: number;
  }> {
    const [critical] = await db
      .select({ count: sql<number>`count(*)` })
      .from(systemAlerts)
      .where(and(eq(systemAlerts.status, "active"), eq(systemAlerts.severity, "critical")));

    const [warning] = await db
      .select({ count: sql<number>`count(*)` })
      .from(systemAlerts)
      .where(and(eq(systemAlerts.status, "active"), eq(systemAlerts.severity, "warning")));

    const [acknowledged] = await db
      .select({ count: sql<number>`count(*)` })
      .from(systemAlerts)
      .where(eq(systemAlerts.status, "acknowledged"));

    const [snoozed] = await db
      .select({ count: sql<number>`count(*)` })
      .from(systemAlerts)
      .where(eq(systemAlerts.status, "snoozed"));

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [resolved] = await db
      .select({ count: sql<number>`count(*)` })
      .from(systemAlerts)
      .where(
        and(
          eq(systemAlerts.status, "resolved"),
          gte(systemAlerts.resolvedAt, twentyFourHoursAgo)
        )
      );

    return {
      criticalCount: Number(critical?.count || 0),
      warningCount: Number(warning?.count || 0),
      acknowledgedCount: Number(acknowledged?.count || 0),
      snoozedCount: Number(snoozed?.count || 0),
      resolvedCount24h: Number(resolved?.count || 0),
    };
  }

  getLastEvaluationTime(): Date | null {
    return this.lastEvaluationTime;
  }

  isCurrentlyEvaluating(): boolean {
    return this.isEvaluating;
  }
}

export const alertEvaluator = new AlertEvaluatorService();

export async function handleAlertEvaluateJob(): Promise<void> {
  await alertEvaluator.evaluateAllBudgets();
}
