/**
 * Portal Metrics Hook - Captures route transition timing and JS errors
 * 
 * Features:
 * - Route transition timing (start on navigation, end on render)
 * - JS error capture (window.onerror, unhandledrejection)
 * - Batched POST to backend with rate limiting
 */

import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";

interface PortalMetricsData {
  routeTransitions: Array<{
    from: string;
    to: string;
    durationMs: number;
    timestamp: number;
  }>;
  jsErrors: Array<{
    message: string;
    source?: string;
    lineno?: number;
    colno?: number;
    timestamp: number;
  }>;
  portalType: "super_admin" | "customer" | "marketing";
}

const BATCH_INTERVAL_MS = 30000; // Send every 30 seconds
const MAX_TRANSITIONS = 50;
const MAX_ERRORS = 20;

class PortalMetricsCollector {
  private routeTransitions: PortalMetricsData["routeTransitions"] = [];
  private jsErrors: PortalMetricsData["jsErrors"] = [];
  private lastRoute: string = "";
  private navigationStartTime: number = 0;
  private batchTimer: ReturnType<typeof setInterval> | null = null;
  private portalType: PortalMetricsData["portalType"] = "super_admin";

  constructor() {
    this.setupErrorHandlers();
  }

  private setupErrorHandlers() {
    if (typeof window === "undefined") return;

    window.onerror = (message, source, lineno, colno) => {
      this.recordJsError({
        message: String(message),
        source,
        lineno,
        colno,
        timestamp: Date.now(),
      });
      return false;
    };

    window.addEventListener("unhandledrejection", (event) => {
      this.recordJsError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: Date.now(),
      });
    });
  }

  setPortalType(type: PortalMetricsData["portalType"]) {
    this.portalType = type;
  }

  startNavigation(fromRoute: string) {
    this.lastRoute = fromRoute;
    this.navigationStartTime = performance.now();
  }

  endNavigation(toRoute: string) {
    if (this.navigationStartTime === 0) {
      this.lastRoute = toRoute;
      return;
    }

    const durationMs = Math.round(performance.now() - this.navigationStartTime);
    
    this.routeTransitions.push({
      from: this.lastRoute,
      to: toRoute,
      durationMs,
      timestamp: Date.now(),
    });

    if (this.routeTransitions.length > MAX_TRANSITIONS) {
      this.routeTransitions = this.routeTransitions.slice(-MAX_TRANSITIONS);
    }

    this.lastRoute = toRoute;
    this.navigationStartTime = 0;
  }

  recordJsError(error: PortalMetricsData["jsErrors"][0]) {
    this.jsErrors.push(error);
    if (this.jsErrors.length > MAX_ERRORS) {
      this.jsErrors = this.jsErrors.slice(-MAX_ERRORS);
    }
  }

  startBatching() {
    if (this.batchTimer) return;
    
    this.batchTimer = setInterval(() => {
      this.flush();
    }, BATCH_INTERVAL_MS);
  }

  stopBatching() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
  }

  async flush() {
    if (this.routeTransitions.length === 0 && this.jsErrors.length === 0) {
      return;
    }

    const data: PortalMetricsData = {
      routeTransitions: [...this.routeTransitions],
      jsErrors: [...this.jsErrors],
      portalType: this.portalType,
    };

    this.routeTransitions = [];
    this.jsErrors = [];

    try {
      await fetch("/api/portal-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
    } catch (error) {
      console.warn("[PortalMetrics] Failed to send metrics:", error);
    }
  }

  getStats() {
    return {
      pendingTransitions: this.routeTransitions.length,
      pendingErrors: this.jsErrors.length,
      portalType: this.portalType,
    };
  }
}

const metricsCollector = new PortalMetricsCollector();

export function usePortalMetrics(portalType: PortalMetricsData["portalType"] = "super_admin") {
  const [location] = useLocation();
  const lastLocationRef = useRef(location);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    metricsCollector.setPortalType(portalType);
    metricsCollector.startBatching();

    return () => {
      metricsCollector.flush();
      metricsCollector.stopBatching();
    };
  }, [portalType]);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      lastLocationRef.current = location;
      return;
    }

    if (location !== lastLocationRef.current) {
      metricsCollector.startNavigation(lastLocationRef.current);
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          metricsCollector.endNavigation(location);
        });
      });

      lastLocationRef.current = location;
    }
  }, [location]);

  const recordError = useCallback((message: string, source?: string) => {
    metricsCollector.recordJsError({
      message,
      source,
      timestamp: Date.now(),
    });
  }, []);

  const forceFlush = useCallback(() => {
    metricsCollector.flush();
  }, []);

  return {
    recordError,
    forceFlush,
    getStats: () => metricsCollector.getStats(),
  };
}

export { metricsCollector };
