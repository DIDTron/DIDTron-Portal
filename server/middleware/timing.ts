import { Request, Response, NextFunction } from "express";

const SLOW_THRESHOLD_MS = 1000;

export function timingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  const originalEnd = res.end;
  
  res.end = function(this: Response, ...args: any[]) {
    const duration = Date.now() - start;
    
    if (duration > SLOW_THRESHOLD_MS) {
      console.warn(`[SLOW API] ${req.method} ${req.path} took ${duration}ms`);
    }
    
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    
    return originalEnd.apply(this, args as any);
  };
  
  next();
}
