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

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
