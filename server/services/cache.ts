import { getRedisClient } from "./redis-session";

const CACHE_TTL = {
  SIDEBAR_COUNTS: 60,    // 60 seconds
  DASHBOARD_SUMMARY: 30, // 30 seconds
  PERMISSIONS: 300,      // 5 minutes
};

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;
  try {
    const cached = await redis.get(key);
    if (cached === null || cached === undefined) return null;
    if (typeof cached === 'string') {
      return JSON.parse(cached) as T;
    }
    return cached as T;
  } catch (error) {
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
};

export { CACHE_TTL };
