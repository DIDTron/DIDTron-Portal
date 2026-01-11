import { Redis } from "@upstash/redis";
import { RedisStore } from "connect-redis";
import { storage } from "../storage";
import { getUpstashRedis } from "./integrations";

let redisClient: Redis | null = null;
let redisStore: RedisStore | null = null;

export async function initializeRedisSession(): Promise<{
  store: RedisStore | null;
  client: Redis | null;
  isReady: boolean;
}> {
  try {
    const credentials = await getUpstashRedis(storage);
    
    if (!credentials?.url || !credentials?.token) {
      console.log("[Redis] No Upstash credentials configured - will use MemoryStore");
      return { store: null, client: null, isReady: false };
    }
    
    redisClient = new Redis({
      url: credentials.url,
      token: credentials.token,
    });

    const pingResult = await redisClient.ping();
    if (pingResult !== "PONG") {
      console.error("[Redis] Ping failed - unexpected response:", pingResult);
      return { store: null, client: null, isReady: false };
    }

    redisStore = new RedisStore({
      client: redisClient,
      prefix: "didtron:sess:",
      ttl: 86400,
    });

    console.log("[Redis] Session store initialized successfully");
    return { store: redisStore, client: redisClient, isReady: true };
  } catch (error) {
    console.error("[Redis] Failed to initialize session store:", error);
    return { store: null, client: null, isReady: false };
  }
}

export function getRedisClient(): Redis | null {
  return redisClient;
}

export function getRedisStore(): RedisStore | null {
  return redisStore;
}

export async function acquireDistributedLock(
  lockKey: string,
  ttlSeconds: number = 60
): Promise<boolean> {
  if (!redisClient) {
    console.warn("[Redis] No client available for distributed lock");
    return true;
  }

  try {
    const lockValue = `${process.pid}-${Date.now()}`;
    const result = await redisClient.set(lockKey, lockValue, {
      nx: true,
      ex: ttlSeconds,
    });
    return result === "OK";
  } catch (error) {
    console.error("[Redis] Failed to acquire lock:", lockKey, error);
    return false;
  }
}

export async function releaseDistributedLock(lockKey: string): Promise<boolean> {
  if (!redisClient) {
    return true;
  }

  try {
    await redisClient.del(lockKey);
    return true;
  } catch (error) {
    console.error("[Redis] Failed to release lock:", lockKey, error);
    return false;
  }
}

export async function refreshLock(lockKey: string, ttlSeconds: number = 60): Promise<boolean> {
  if (!redisClient) {
    return true;
  }

  try {
    const result = await redisClient.expire(lockKey, ttlSeconds);
    return result === 1;
  } catch (error) {
    console.error("[Redis] Failed to refresh lock:", lockKey, error);
    return false;
  }
}
