import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { performanceMonitor } from "./services/performance-monitor";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Optimized pool configuration for better performance
// - max: Maximum number of clients in the pool (default: 10, we use 20 for better concurrency)
// - idleTimeoutMillis: Close idle clients after 30 seconds to prevent connection churn
// - connectionTimeoutMillis: Fail fast after 10 seconds if connection cannot be established
// - maxUses: Close connection after 7500 queries to prevent memory leaks
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxUses: 7500,
});

const originalQuery = pool.query.bind(pool);
function extractQueryText(query: any): string {
  if (typeof query === 'string') {
    return query.replace(/\s+/g, ' ').trim().slice(0, 100);
  }
  if (query && typeof query.text === 'string') {
    return query.text.replace(/\s+/g, ' ').trim().slice(0, 100);
  }
  return 'prepared';
}

(pool as any).query = function instrumentedQuery(...args: unknown[]) {
  const start = Date.now();
  const result = (originalQuery as Function).apply(pool, args);
  
  if (result && typeof result.then === 'function') {
    return result.then((res: any) => {
      const duration = Date.now() - start;
      performanceMonitor.recordQueryExecutionTime(extractQueryText(args[0]), duration);
      return res;
    }).catch((err: any) => {
      const duration = Date.now() - start;
      performanceMonitor.recordQueryExecutionTime(extractQueryText(args[0]), duration);
      throw err;
    });
  }
  
  return result;
};

export const db = drizzle(pool, { schema });

/**
 * Get real database pool statistics
 * Uses node-postgres Pool's built-in stats: totalCount, idleCount, waitingCount
 */
export function getPoolStats(): {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
  maxConnections: number;
  usedCount: number;
  saturation: number;
} {
  const totalCount = pool.totalCount;
  const idleCount = pool.idleCount;
  const waitingCount = pool.waitingCount;
  const maxConnections = 20; // Configured max in pool settings above
  const usedCount = totalCount - idleCount;
  const saturation = maxConnections > 0 ? usedCount / maxConnections : 0;
  
  return {
    totalCount,
    idleCount,
    waitingCount,
    maxConnections,
    usedCount,
    saturation,
  };
}
