import { Redis } from "@upstash/redis";

let redisClient: Redis | null | undefined;

/** Returns null when Upstash is not configured (local development remains usable). */
export function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

export async function cacheJson<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function readCachedJson<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  return redis.get<T>(key);
}
