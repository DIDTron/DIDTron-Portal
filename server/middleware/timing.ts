import { Request, Response, NextFunction } from "express";
import { performanceMonitor } from "../services/performance-monitor";

const SLOW_THRESHOLD_MS = 1000;

export function timingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  const originalEnd = res.end;
  
  res.end = function(this: Response, ...args: any[]) {
    const duration = Date.now() - start;
    const endpoint = `${req.method} ${req.path}`;
    
    performanceMonitor.recordApiResponseTime(endpoint, duration);
    
    if (duration > SLOW_THRESHOLD_MS) {
      console.warn(`[SLOW API] ${endpoint} took ${duration}ms`);
    }
    
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    
    return originalEnd.apply(this, args as any);
  };
  
  next();
}

let memoryInterval: NodeJS.Timeout | null = null;

export function startMemoryMonitoring(intervalMs = 60000) {
  if (memoryInterval) return;
  memoryInterval = setInterval(() => {
    const usage = process.memoryUsage();
    const heapMb = Math.round(usage.heapUsed / 1024 / 1024);
    performanceMonitor.recordMemoryUsage(heapMb);
  }, intervalMs);
}

export function stopMemoryMonitoring() {
  if (memoryInterval) {
    clearInterval(memoryInterval);
    memoryInterval = null;
  }
}
