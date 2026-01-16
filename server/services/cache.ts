import { getRedisClient } from "./redis-session";

const CACHE_TTL = {
  SIDEBAR_COUNTS: 60,       // 60 seconds
  DASHBOARD_SUMMARY: 60,    // 60 seconds (extended from 30s to reduce DB load)
  PERMISSIONS: 300,         // 5 minutes
  SYSTEM_OVERVIEW: 60,      // 60 seconds for system status overview metrics
  SYSTEM_ALERTS: 30,        // 30 seconds for active alerts (need fresher data)
  SYSTEM_HEALTH: 60,        // 60 seconds for health checks
  CONNEXCS_DROPDOWNS: 90,   // 90 seconds for ConnexCS dropdown data (per CONSTITUTION RULE 4)
};

/**
 * Cache statistics for hit rate monitoring
 * Tracks hits and misses for Redis cache operations
 */
export const cacheStats = {
  hits: 0,
  misses: 0,
  lastReset: new Date(),
  
  recordHit() {
    this.hits++;
  },
  
  recordMiss() {
    this.misses++;
  },
  
  getHitRate(): number {
    const total = this.hits + this.misses;
    if (total === 0) return 1; // No operations = 100% (not a problem)
    return this.hits / total;
  },
  
  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      total: this.hits + this.misses,
      hitRate: this.getHitRate(),
      lastReset: this.lastReset,
    };
  },
  
  reset() {
    this.hits = 0;
    this.misses = 0;
    this.lastReset = new Date();
  },
};

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) {
    cacheStats.recordMiss();
    return null;
  }
  try {
    const cached = await redis.get(key);
    if (cached === null || cached === undefined) {
      cacheStats.recordMiss();
      return null;
    }
    cacheStats.recordHit();
    if (typeof cached === 'string') {
      return JSON.parse(cached) as T;
    }
    return cached as T;
  } catch (error) {
    cacheStats.recordMiss();
    console.error("[Cache] Get error:", error);
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (error) {
    console.error("[Cache] Set error:", error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("[Cache] Invalidate error:", error);
  }
}

export async function invalidateCacheKey(key: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.error("[Cache] Delete error:", error);
  }
}

export const CACHE_KEYS = {
  sidebarCounts: (userId: string) => `sidebar:counts:${userId}`,
  dashboardSummary: () => `dashboard:summary`,
  userPermissions: (userId: string) => `permissions:${userId}`,
  systemOverview: () => `system:overview`,
  systemAlertCount: () => `system:alert:count`,
  systemHealthChecks: () => `system:health:checks`,
  systemMetricsLatest: (type: string) => `system:metrics:${type}:latest`,
  connexcsServers: () => `connexcs:servers`,
};

export { CACHE_TTL };
