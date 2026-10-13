/**
 * In-memory, single-instance Redis-compatible store.
 *
 * Ported from the monolith's `src/server/redis.ts` + `src/lib/redis.ts`. It is
 * process-local, so it is only suitable for single-instance deployments; swap
 * for `ioredis` when scaling horizontally (see task.md §10).
 */

type StoreEntry = {
  value: unknown;
  expiresAt?: number;
};

const store = new Map<string, StoreEntry>();

function isExpired(entry: StoreEntry | undefined): boolean {
  return !!entry?.expiresAt && Date.now() > entry.expiresAt;
}

function cleanupIfExpired(key: string): boolean {
  const entry = store.get(key);
  if (entry && isExpired(entry)) {
    store.delete(key);
    return true;
  }
  return false;
}

export const redis = {
  async get<T>(key: string): Promise<T | null> {
    if (cleanupIfExpired(key)) return null;
    const entry = store.get(key);
    return (entry?.value as T) ?? null;
  },

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<"OK"> {
    const expiresAt = options?.ex ? Date.now() + options.ex * 1000 : undefined;
    store.set(key, { value, expiresAt });
    return "OK";
  },

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (store.delete(key)) count++;
    }
    return count;
  },

  async keys(pattern: string): Promise<string[]> {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    const regex = new RegExp(`^${escaped}$`);

    const results: string[] = [];
    for (const key of store.keys()) {
      cleanupIfExpired(key);
      if (store.has(key) && regex.test(key)) results.push(key);
    }
    return results;
  },

  async incr(key: string): Promise<number> {
    const current = (await redis.get<number>(key)) ?? 0;
    const next = current + 1;
    await redis.set(key, next);
    return next;
  },

  async expire(key: string, seconds: number): Promise<"OK"> {
    const entry = store.get(key);
    if (!entry) return "OK";
    entry.expiresAt = Date.now() + seconds * 1000;
    store.set(key, entry);
    return "OK";
  },
};

export const CACHE_KEYS = {
  USER: "user:",
  SESSION: "session:",
  RATE_LIMIT: "rate-limit:",
  HEALTH: "health:",
  METRICS: "metrics:",
} as const;

export const TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  STALE: 7200,
} as const;

/** Longer-lived TTLs (seconds) matching the monolith's `server/redis.ts`. */
export const CACHE_TTL = {
  SHORT: 60 * 5,
  MEDIUM: 60 * 30,
  LONG: 60 * 60 * 24,
  SESSION: 60 * 60 * 24 * 30,
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

function formatCacheKey(prefix: string, key: string): string {
  return `${prefix}${key}`;
}

export async function cache<T>(
  key: string,
  getData: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const { ttl = TTL.MEDIUM, tags = [], prefix = "", staleWhileRevalidate = true } = options;

  const cacheKey = formatCacheKey(prefix, key);

  try {
    const cachedValue = await redis.get<CacheEntry<T>>(cacheKey);

    if (cachedValue?.timestamp) {
      const age = Date.now() - cachedValue.timestamp;

      if (age < ttl * 1000) {
        return cachedValue.data;
      }

      if (staleWhileRevalidate) {
        void revalidateData(cacheKey, getData, { ttl, tags });
        return cachedValue.data;
      }
    }

    const freshData = await getData();

    await redis.set(cacheKey, { data: freshData, timestamp: Date.now(), tags }, { ex: ttl });

    return freshData;
  } catch (error) {
    console.error("Cache error:", error);
    return getData();
  }
}

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

export async function revalidateTag(tag: string): Promise<void> {
  try {
    const keys = await redis.keys("*");
    await Promise.all(
      keys.map(async (key) => {
        const entry = await redis.get<CacheEntry<unknown>>(key);
        if (entry?.tags.includes(tag)) {
          await redis.del(key);
        }
      }),
    );
  } catch (error) {
    console.error("Tag revalidation error:", error);
  }
}

export async function checkRedisConnection(): Promise<{
  ok: boolean;
  latency: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    const testKey = formatCacheKey(CACHE_KEYS.HEALTH, "test");
    await redis.set(testKey, "health-check");
    await redis.get(testKey);
    await redis.del(testKey);

    return { ok: true, latency: Date.now() - start };
  } catch (error) {
    return {
      ok: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Exercise the cache + rate-limit primitives so `/api/health` can report which
 * Redis-backed features are working. Ported from the monolith's `lib/redis.ts`.
 */
export async function testRedisFeatures(): Promise<{
  ok: boolean;
  results: {
    notifications: { ok: boolean };
    caching: { ok: boolean };
    rateLimiting: { ok: boolean };
  };
}> {
  const results = {
    notifications: { ok: true },
    caching: { ok: true },
    rateLimiting: { ok: true },
  };

  try {
    const testKey = formatCacheKey(CACHE_KEYS.HEALTH, "feature-test");
    await redis.set(testKey, { test: true });
    const cached = await redis.get(testKey);
    await redis.del(testKey);

    if (!cached) {
      results.caching.ok = false;
    }

    const rateKey = formatCacheKey(CACHE_KEYS.RATE_LIMIT, "feature-test");
    await rateLimiting.increment(rateKey, 60);
    const count = await rateLimiting.get(rateKey);
    await rateLimiting.reset(rateKey);

    if (count !== 1) {
      results.rateLimiting.ok = false;
    }
  } catch (error) {
    console.error("Redis feature test error:", error);
    return { ok: false, results };
  }

  return {
    ok: Object.values(results).every((result) => result.ok),
    results,
  };
}

export const sessionCache = {
  async set(key: string, session: unknown) {
    await redis.set(key, session, { ex: TTL.LONG });
  },

  async get<T>(key: string): Promise<T | null> {
    return redis.get<T>(key);
  },

  async delete(key: string) {
    await redis.del(key);
  },
};

export const rateLimiting = {
  async increment(key: string, windowSeconds: number) {
    const rateKey = `${CACHE_KEYS.RATE_LIMIT}${key}`;
    const count = await redis.incr(rateKey);
    if (count === 1) {
      await redis.expire(rateKey, windowSeconds);
    }
    return count;
  },

  async get(key: string): Promise<number> {
    const rateKey = `${CACHE_KEYS.RATE_LIMIT}${key}`;
    const value = await redis.get<number>(rateKey);
    return value ?? 0;
  },

  async reset(key: string) {
    const rateKey = `${CACHE_KEYS.RATE_LIMIT}${key}`;
    await redis.del(rateKey);
  },
};
