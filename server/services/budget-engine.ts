/**
 * Budget Engine - Reusable threshold evaluation with hysteresis
 * 
 * Features:
 * - Per-metric WARN and CRITICAL thresholds
 * - Consecutive interval breach detection (default: 2 intervals to trigger)
 * - Auto-clear after N consecutive intervals below threshold
 * - In-memory state tracking per metric key
 */

export type Severity = "warn" | "critical";

export interface BudgetThreshold {
  warn: number;
  critical: number;
  /** For rate-based metrics: true means "above threshold is bad", false means "below threshold is bad" */
  higherIsBad: boolean;
}

export interface ViolationRecord {
  metricName: string;
  actual: number;
  threshold: number;
  severity: Severity;
  endpoint?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

interface MetricState {
  breachCount: number;
  clearCount: number;
  currentSeverity: Severity | null;
  isViolating: boolean;
  lastValue: number;
  lastChecked: Date;
}

class BudgetEngine {
  private state = new Map<string, MetricState>();
  private violations: ViolationRecord[] = [];
  private readonly consecutiveBreachThreshold: number;
  private readonly consecutiveClearThreshold: number;
  private readonly maxViolationHistory: number;

  constructor(
    consecutiveBreachThreshold = 2,
    consecutiveClearThreshold = 2,
    maxViolationHistory = 500
  ) {
    this.consecutiveBreachThreshold = consecutiveBreachThreshold;
    this.consecutiveClearThreshold = consecutiveClearThreshold;
    this.maxViolationHistory = maxViolationHistory;
  }

  /**
   * Generate a unique key for tracking metric state
   */
  private getMetricKey(metricName: string, endpoint?: string): string {
    return endpoint ? `${metricName}:${endpoint}` : metricName;
  }

  /**
   * Evaluate a metric value against thresholds with hysteresis
   * Returns true if a NEW violation was created, false otherwise
   */
  evaluate(
    metricName: string,
    actual: number,
    thresholds: BudgetThreshold,
    endpoint?: string,
    details?: Record<string, unknown>
  ): { violated: boolean; newViolation: boolean; severity: Severity | null } {
    const key = this.getMetricKey(metricName, endpoint);
    const now = new Date();

    // Get or create state
    let state = this.state.get(key);
    if (!state) {
      state = {
        breachCount: 0,
        clearCount: 0,
        currentSeverity: null,
        isViolating: false,
        lastValue: actual,
        lastChecked: now,
      };
      this.state.set(key, state);
    }

    // Determine if current value is breaching
    const { severity, breaching } = this.checkThresholds(actual, thresholds);

    let newViolation = false;

    if (breaching) {
      // Value is above/below threshold
      state.breachCount++;
      state.clearCount = 0;
      state.lastValue = actual;
      state.lastChecked = now;

      if (!state.isViolating && state.breachCount >= this.consecutiveBreachThreshold) {
        // Trigger new violation
        state.isViolating = true;
        state.currentSeverity = severity;
        newViolation = true;

        const threshold = severity === "critical" ? thresholds.critical : thresholds.warn;
        const violation: ViolationRecord = {
          metricName,
          actual,
          threshold,
          severity,
          endpoint,
          timestamp: now,
          details,
        };
        this.violations.push(violation);

        // Trim history
        if (this.violations.length > this.maxViolationHistory) {
          this.violations = this.violations.slice(-this.maxViolationHistory);
        }

        console.log(
          `[BudgetEngine] NEW VIOLATION: ${metricName}${endpoint ? ` (${endpoint})` : ""} = ${actual} (threshold: ${threshold}, severity: ${severity}, consecutive breaches: ${state.breachCount})`
        );
      } else if (state.isViolating) {
        // Update severity if it changed
        if (severity === "critical" && state.currentSeverity === "warn") {
          state.currentSeverity = "critical";
          console.log(
            `[BudgetEngine] ESCALATED: ${metricName}${endpoint ? ` (${endpoint})` : ""} escalated from warn to critical`
          );
        }
      } else {
        // Still accumulating breaches
        console.log(
          `[BudgetEngine] BREACH ${state.breachCount}/${this.consecutiveBreachThreshold}: ${metricName}${endpoint ? ` (${endpoint})` : ""} = ${actual}`
        );
      }
    } else {
      // Value is within acceptable range
      state.clearCount++;
      state.breachCount = 0;
      state.lastValue = actual;
      state.lastChecked = now;

      if (state.isViolating && state.clearCount >= this.consecutiveClearThreshold) {
        // Clear the violation
        console.log(
          `[BudgetEngine] CLEARED: ${metricName}${endpoint ? ` (${endpoint})` : ""} - ${state.clearCount} consecutive intervals under threshold`
        );
        state.isViolating = false;
        state.currentSeverity = null;
      } else if (state.isViolating) {
        console.log(
          `[BudgetEngine] CLEARING ${state.clearCount}/${this.consecutiveClearThreshold}: ${metricName}${endpoint ? ` (${endpoint})` : ""} = ${actual}`
        );
      }
    }

    return {
      violated: state.isViolating,
      newViolation,
      severity: state.currentSeverity,
    };
  }

  /**
   * Check if value breaches thresholds and determine severity
   */
  private checkThresholds(
    actual: number,
    thresholds: BudgetThreshold
  ): { severity: Severity; breaching: boolean } {
    if (thresholds.higherIsBad) {
      // Higher is bad (e.g., error rate, latency, saturation)
      if (actual >= thresholds.critical) {
        return { severity: "critical", breaching: true };
      }
      if (actual >= thresholds.warn) {
        return { severity: "warn", breaching: true };
      }
    } else {
      // Lower is bad (e.g., hit rate)
      if (actual <= thresholds.critical) {
        return { severity: "critical", breaching: true };
      }
      if (actual <= thresholds.warn) {
        return { severity: "warn", breaching: true };
      }
    }
    return { severity: "warn", breaching: false };
  }

  /**
   * Get all current violations (metrics still in violation state)
   */
  getCurrentViolations(): Array<{ key: string; state: MetricState }> {
    const result: Array<{ key: string; state: MetricState }> = [];
    const entries = Array.from(this.state.entries());
    for (const [key, state] of entries) {
      if (state.isViolating) {
        result.push({ key, state: { ...state } });
      }
    }
    return result;
  }

  /**
   * Get violation history for a time window
   */
  getViolationHistory(windowMs: number = 15 * 60 * 1000): ViolationRecord[] {
    const cutoff = Date.now() - windowMs;
    return this.violations.filter((v) => v.timestamp.getTime() > cutoff);
  }

  /**
   * Get all violation history
   */
  getAllViolations(): ViolationRecord[] {
    return [...this.violations];
  }

  /**
   * Get state for a specific metric
   */
  getMetricState(metricName: string, endpoint?: string): MetricState | null {
    const key = this.getMetricKey(metricName, endpoint);
    return this.state.get(key) || null;
  }

  /**
   * Get count of violations in a time window
   */
  getViolationCount(windowMs: number = 15 * 60 * 1000): number {
    const cutoff = Date.now() - windowMs;
    return this.violations.filter((v) => v.timestamp.getTime() > cutoff).length;
  }

  /**
   * Clear all state (for testing)
   */
  reset(): void {
    this.state.clear();
    this.violations = [];
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    activeViolations: number;
    totalMetricsTracked: number;
    recentViolations15m: number;
    recentViolations1h: number;
  } {
    const now = Date.now();
    const last15m = now - 15 * 60 * 1000;
    const last1h = now - 60 * 60 * 1000;

    let activeViolations = 0;
    const values = Array.from(this.state.values());
    for (const state of values) {
      if (state.isViolating) activeViolations++;
    }

    return {
      activeViolations,
      totalMetricsTracked: this.state.size,
      recentViolations15m: this.violations.filter((v) => v.timestamp.getTime() > last15m).length,
      recentViolations1h: this.violations.filter((v) => v.timestamp.getTime() > last1h).length,
    };
  }
}

// Singleton instance
export const budgetEngine = new BudgetEngine();

// Pre-defined threshold configurations
export const BUDGET_THRESHOLDS = {
  dbPoolSaturation: {
    warn: 0.70,
    critical: 0.85,
    higherIsBad: true,
  } as BudgetThreshold,
  dbPoolWaiting: {
    warn: 1,
    critical: 1,
    higherIsBad: true,
  } as BudgetThreshold,
  redisHitRate: {
    warn: 0.60,
    critical: 0.30,
    higherIsBad: false, // Lower hit rate is bad
  } as BudgetThreshold,
  r2ErrorRate: {
    warn: 0.01, // 1%
    critical: 0.05, // 5%
    higherIsBad: true,
  } as BudgetThreshold,
  stuckJobs: {
    warn: 1,
    critical: 3,
    higherIsBad: true,
  } as BudgetThreshold,
  portalRouteP95: {
    warn: 1500, // 1.5s
    critical: 3000, // 3s
    higherIsBad: true,
  } as BudgetThreshold,
  portalJsErrors: {
    warn: 1, // 1/min
    critical: 5, // 5/min
    higherIsBad: true,
  } as BudgetThreshold,
};
