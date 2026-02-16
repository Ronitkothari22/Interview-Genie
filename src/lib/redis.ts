import { Redis } from "@upstash/redis";
import { env } from "@/env";

// In-memory fallback for rate limits when Upstash is not configured (e.g. local dev)
const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

function createNoopRedis(): Redis {
  return {
    get: async () => null,
    set: async () => "OK",
    del: async () => 0,
    incr: async (key: string) => {
      const entry = rateLimitStore.get(key);
      const now = Date.now();
      if (!entry || now > entry.expiresAt) {
        rateLimitStore.set(key, { count: 1, expiresAt: now + 300_000 });
        return 1;
      }
      entry.count++;
      return entry.count;
    },
    expire: async (key: string, seconds: number) => {
      const entry = rateLimitStore.get(key);
      if (entry) entry.expiresAt = Date.now() + seconds * 1000;
      return "OK";
    },
    keys: async () => [],
  } as unknown as Redis;
}

const hasRedis =
  env.UPSTASH_REDIS_REST_URL &&
  env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client; use in-memory fallback when Upstash is not configured
export const redis = hasRedis
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : createNoopRedis();

// Cache key prefixes
export const CACHE_KEYS = {
  USER: "user:",
  SESSION: "session:",
  RATE_LIMIT: "rate-limit:",
  HEALTH: "health:",
  METRICS: "metrics:",
} as const;

// Cache TTLs in seconds
export const TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  STALE: 7200, // 2 hours (stale data TTL)
} as const;

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  prefix?: string;
  staleWhileRevalidate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  tags: string[];
}

// Helper to format cache keys
function formatCacheKey(prefix: string, key: string): string {
  return `${prefix}${key}`;
}

// Cache wrapper with stale-while-revalidate support
export async function cache<T>(
  key: string,
  getData: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const {
    ttl = TTL.MEDIUM,
    tags = [],
    prefix = "",
    staleWhileRevalidate = true,
  } = options;

  const cacheKey = formatCacheKey(prefix, key);

  try {
    // Try to get data from cache
    const cachedValue = await redis.get(cacheKey);

    if (typeof cachedValue === "string") {
      const parsed = JSON.parse(cachedValue) as CacheEntry<T>;
      const age = Date.now() - parsed.timestamp;

      // If data is fresh, return it
      if (age < ttl * 1000) {
        return parsed.data;
      }

      // If stale but staleWhileRevalidate is enabled
      if (staleWhileRevalidate) {
        // Revalidate in background
        void revalidateData(cacheKey, getData, { ttl, tags });
        // Return stale data
        return parsed.data;
      }
    }

    // Get fresh data
    const freshData = await getData();

    // Cache the fresh data
    await redis.set(
      cacheKey,
      JSON.stringify({
        data: freshData,
        timestamp: Date.now(),
        tags,
      }),
    );

    return freshData;
  } catch (error) {
    console.error("Cache error:", error);
    return getData();
  }
}

// Background data revalidation
async function revalidateData<T>(
  key: string,
  getData: () => Promise<T>,
  options: CacheOptions,
): Promise<void> {
  try {
    const freshData = await getData();
    const entry: CacheEntry<T> = {
      data: freshData,
      timestamp: Date.now(),
      tags: options.tags ?? [],
    };
    await redis.set(key, entry, { ex: options.ttl ?? TTL.MEDIUM });
  } catch (error) {
    console.error("Revalidation error:", error);
  }
}

// Clear cache by tag
export async function revalidateTag(tag: string): Promise<void> {
  try {
    const keys = await redis.keys("*");
    const promises = keys.map(async (key) => {
      const entry = await redis.get<CacheEntry<unknown>>(key);
      if (entry?.tags.includes(tag)) {
        await redis.del(key);
      }
    });
    await Promise.all(promises);
  } catch (error) {
    console.error("Tag revalidation error:", error);
  }
}

// Clear cache by prefix
export async function clearCacheWithPrefix(prefix: string): Promise<void> {
  try {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length === 0) return;
    await redis.del(...keys);
  } catch (error) {
    console.error("Cache clear error:", error);
  }
}

// Health check function
export async function checkRedisConnection(): Promise<{
  ok: boolean;
  latency: number;
  error?: string;
}> {
  // Skip health check during static build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return {
      ok: true,
      latency: 0,
    };
  }

  const start = Date.now();

  try {
    // Test basic operations
    const testKey = formatCacheKey(CACHE_KEYS.HEALTH, "test");
    await redis.set(testKey, "health-check");
    await redis.get(testKey);
    await redis.del(testKey);

    return {
      ok: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      ok: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Test Redis features
export async function testRedisFeatures() {
  // Skip Redis tests during static build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return {
      ok: true,
      results: {
        notifications: { ok: true },
        caching: { ok: true },
        rateLimiting: { ok: true },
      },
    };
  }

  const results = {
    notifications: { ok: true },
    caching: { ok: true },
    rateLimiting: { ok: true },
  };

  try {
    // Test caching
    const testKey = formatCacheKey(CACHE_KEYS.HEALTH, "feature-test");
    await redis.set(testKey, { test: true });
    const cached = await redis.get(testKey);
    await redis.del(testKey);

    if (!cached) {
      results.caching.ok = false;
    }

    // Test rate limiting
    const rateKey = formatCacheKey(CACHE_KEYS.RATE_LIMIT, "feature-test");
    await rateLimiting.increment(rateKey, 60);
    const count = await rateLimiting.get(rateKey);
    await rateLimiting.reset(rateKey);

    if (count !== 1) {
      results.rateLimiting.ok = false;
    }
  } catch (error) {
    console.error("Redis feature test error:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      results,
    };
  }

  return {
    ok: true,
    results,
  };
}

// Cache warming utility
export async function warmCache<T>(
  keys: string[],
  getData: (key: string) => Promise<T>,
  options: CacheOptions = {},
): Promise<void> {
  try {
    const promises = keys.map((key) => cache(key, () => getData(key), options));
    await Promise.all(promises);
  } catch (error) {
    console.error("Cache warming error:", error);
  }
}

// Session cache utilities
export const sessionCache = {
  async set(token: string, session: any): Promise<void> {
    const key = formatCacheKey(CACHE_KEYS.SESSION, token);
    await redis.set(key, session, { ex: TTL.LONG });
  },

  async get(token: string): Promise<any> {
    const key = formatCacheKey(CACHE_KEYS.SESSION, token);
    return redis.get(key);
  },

  async delete(token: string): Promise<void> {
    const key = formatCacheKey(CACHE_KEYS.SESSION, token);
    await redis.del(key);
  },
};

// Rate limiting utilities
export const rateLimiting = {
  async increment(key: string, windowSeconds: number): Promise<number> {
    const rateKey = formatCacheKey(CACHE_KEYS.RATE_LIMIT, key);
    const count = await redis.incr(rateKey);
    if (count === 1) {
      await redis.expire(rateKey, windowSeconds);
    }
    return count;
  },

  async get(key: string): Promise<number> {
    const rateKey = formatCacheKey(CACHE_KEYS.RATE_LIMIT, key);
    const value = await redis.get<string>(rateKey);
    return parseInt(value ?? "0", 10);
  },

  async reset(key: string): Promise<void> {
    const rateKey = formatCacheKey(CACHE_KEYS.RATE_LIMIT, key);
    await redis.del(rateKey);
  },
};
