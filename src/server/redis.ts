import { Redis } from "@upstash/redis";
import { env } from "@/env";

const hasRedis =
  env.UPSTASH_REDIS_REST_URL &&
  env.UPSTASH_REDIS_REST_TOKEN;

// Use no-op when Upstash is not configured (e.g. local dev without Redis)
export const redis = hasRedis
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : ({
      get: async () => null,
      set: async () => "OK",
      del: async () => 0,
      keys: async () => [],
    } as unknown as Redis);

// Cache TTL constants
export const CACHE_TTL = {
  SHORT: 60 * 5, // 5 minutes
  MEDIUM: 60 * 30, // 30 minutes
  LONG: 60 * 60 * 24, // 24 hours
  SESSION: 60 * 60 * 24 * 30, // 30 days
};

// Cache key prefixes
export const CACHE_KEYS = {
  SESSION: "session",
  USER: "user",
  STATS: "stats",
};

// Generic cache utility
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM,
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fetchFn();
  await redis.set(key, data, { ex: ttl });
  return data;
}

// Session-specific cache utilities
export const sessionCache = {
  async get(token: string) {
    return redis.get(`${CACHE_KEYS.SESSION}:${token}`);
  },

  async set(token: string, data: any) {
    return redis.set(`${CACHE_KEYS.SESSION}:${token}`, data, {
      ex: CACHE_TTL.SESSION,
    });
  },

  async delete(token: string) {
    return redis.del(`${CACHE_KEYS.SESSION}:${token}`);
  },
};

// User-specific cache utilities
export const userCache = {
  async get(id: string) {
    return redis.get(`${CACHE_KEYS.USER}:${id}`);
  },

  async set(id: string, data: any) {
    return redis.set(`${CACHE_KEYS.USER}:${id}`, data, {
      ex: CACHE_TTL.MEDIUM,
    });
  },

  async delete(id: string) {
    return redis.del(`${CACHE_KEYS.USER}:${id}`);
  },
};
