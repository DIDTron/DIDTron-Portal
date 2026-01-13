import { brevoService } from "../brevo";

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  timestamp: Date;
}

interface PerformanceBudget {
  apiResponseTime: number;
  queryExecutionTime: number;
  memoryUsageMb: number;
  cpuUsagePercent: number;
}

interface PerformanceViolation {
  metric: string;
  actual: number;
  threshold: number;
  unit: string;
  timestamp: Date;
  endpoint?: string;
}

const DEFAULT_BUDGET: PerformanceBudget = {
  apiResponseTime: 500,
  queryExecutionTime: 200,
  memoryUsageMb: 512,
  cpuUsagePercent: 80,
};

class PerformanceMonitorService {
  private budget: PerformanceBudget;
  private violations: PerformanceViolation[] = [];
  private lastAlertTime: Date | null = null;
  private alertCooldownMs = 15 * 60 * 1000;
  private adminEmail: string | null = null;

  constructor() {
    this.budget = { ...DEFAULT_BUDGET };
    this.adminEmail = process.env.SUPER_ADMIN_EMAIL || null;
  }

  setBudget(budget: Partial<PerformanceBudget>) {
    this.budget = { ...this.budget, ...budget };
  }

  getBudget(): PerformanceBudget {
    return { ...this.budget };
  }

  setAdminEmail(email: string) {
    this.adminEmail = email;
  }

  recordApiResponseTime(endpoint: string, durationMs: number) {
    if (durationMs > this.budget.apiResponseTime) {
      this.recordViolation({
        metric: "API Response Time",
        actual: durationMs,
        threshold: this.budget.apiResponseTime,
        unit: "ms",
        timestamp: new Date(),
        endpoint,
      });
    }
  }

  recordQueryExecutionTime(query: string, durationMs: number) {
    if (durationMs > this.budget.queryExecutionTime) {
      this.recordViolation({
        metric: "Query Execution Time",
        actual: durationMs,
        threshold: this.budget.queryExecutionTime,
        unit: "ms",
        timestamp: new Date(),
        endpoint: query.substring(0, 100),
      });
    }
  }

  recordMemoryUsage(usageMb: number) {
    if (usageMb > this.budget.memoryUsageMb) {
      this.recordViolation({
        metric: "Memory Usage",
        actual: usageMb,
        threshold: this.budget.memoryUsageMb,
        unit: "MB",
        timestamp: new Date(),
      });
    }
  }

  private recordViolation(violation: PerformanceViolation) {
    this.violations.push(violation);
    if (this.violations.length > 1000) {
      this.violations = this.violations.slice(-500);
    }
    console.warn(
      `[Performance] Budget exceeded: ${violation.metric} = ${violation.actual}${violation.unit} (threshold: ${violation.threshold}${violation.unit})${violation.endpoint ? ` at ${violation.endpoint}` : ""}`
    );
    this.maybeAlert();
  }

  private async maybeAlert() {
    if (!this.adminEmail) return;
    const now = new Date();
    if (this.lastAlertTime && now.getTime() - this.lastAlertTime.getTime() < this.alertCooldownMs) {
      return;
    }
    const recentViolations = this.violations.filter(
      (v) => now.getTime() - v.timestamp.getTime() < this.alertCooldownMs
    );
    if (recentViolations.length < 5) return;
    this.lastAlertTime = now;
    const violationSummary = recentViolations
      .slice(0, 10)
      .map(
        (v) =>
          `- ${v.metric}: ${v.actual}${v.unit} (threshold: ${v.threshold}${v.unit})${v.endpoint ? ` - ${v.endpoint}` : ""}`
      )
      .join("\n");
    const htmlContent = `
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
          <h2 style="color: #dc2626;">Performance Budget Alert</h2>
          <p>The DIDTron platform has detected <strong>${recentViolations.length}</strong> performance budget violations in the last 15 minutes.</p>
          <h3>Recent Violations:</h3>
          <pre style="background: #f3f4f6; padding: 15px; border-radius: 8px; overflow-x: auto;">${violationSummary}</pre>
          <p style="color: #6b7280; font-size: 14px;">This alert was sent because performance thresholds were exceeded. Review the System Status page for details.</p>
        </body>
      </html>
    `;
    try {
      await brevoService.sendEmail({
        to: this.adminEmail,
        subject: `[DIDTron Alert] ${recentViolations.length} Performance Budget Violations`,
        htmlContent,
        tags: ["performance", "alert"],
      });
      console.log(`[Performance] Alert sent to ${this.adminEmail}`);
    } catch (error) {
      console.error("[Performance] Failed to send alert email:", error);
    }
  }

  getRecentViolations(limit = 50): PerformanceViolation[] {
    return this.violations.slice(-limit);
  }

  getStats() {
    const now = new Date();
    const last15min = this.violations.filter(
      (v) => now.getTime() - v.timestamp.getTime() < 15 * 60 * 1000
    );
    const lastHour = this.violations.filter(
      (v) => now.getTime() - v.timestamp.getTime() < 60 * 60 * 1000
    );
    return {
      totalViolations: this.violations.length,
      last15Minutes: last15min.length,
      lastHour: lastHour.length,
      budget: this.budget,
      lastAlertTime: this.lastAlertTime,
    };
  }

  clearViolations() {
    this.violations = [];
    this.lastAlertTime = null;
  }
}

export const performanceMonitor = new PerformanceMonitorService();
