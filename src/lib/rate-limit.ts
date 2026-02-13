import { NextResponse } from "next/server";
import { env } from "@/env";

interface RateLimitStore {
  timestamp: number;
  count: number;
}

const stores = new Map<string, Map<string, RateLimitStore>>();

export class RateLimit {
  private store: Map<string, RateLimitStore>;

  constructor(private name: string) {
    if (!stores.has(name)) {
      stores.set(name, new Map());
    }
    this.store = stores.get(name)!;
  }

  async check(key: string, limit: number, windowMs: number = 60000) {
    const now = Date.now();
    const store = this.store.get(key) ?? { timestamp: now, count: 0 };

    // Reset if outside window
    if (now - store.timestamp > windowMs) {
      store.timestamp = now;
      store.count = 0;
    }

    // Increment count
    store.count++;
    this.store.set(key, store);

    // Clean up old entries every 5 minutes
    if (now % (5 * 60 * 1000) < 1000) {
      this.cleanup(windowMs);
    }

    return {
      success: store.count <= limit,
      current: store.count,
      limit,
      remaining: Math.max(0, limit - store.count),
      reset: store.timestamp + windowMs,
    };
  }

  private cleanup(windowMs: number) {
    const now = Date.now();
    for (const [key, store] of this.store.entries()) {
      if (now - store.timestamp > windowMs) {
        this.store.delete(key);
      }
    }
  }
}

function getClientIp(req: Request): string {
  // Get IP from various headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  const trueClientIp = req.headers.get("true-client-ip");

  // Split forwarded-for and get the first IP
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  // Return the first valid IP found
  return forwardedIp ?? realIp ?? cfConnectingIp ?? trueClientIp ?? "127.0.0.1";
}

export async function rateLimit(
  req: Request,
  identifier: string,
  limit: number,
  windowMs: number = 60000,
) {
  // Get client IP
  const ip = getClientIp(req);

  // Get deployment URL from env
  const deploymentUrl = new URL(env.NEXT_PUBLIC_APP_URL).hostname;

  // Create a unique key that includes the deployment URL
  const key = `${deploymentUrl}:${ip}:${identifier}`;

  const rateLimit = new RateLimit(identifier);
  const result = await rateLimit.check(key, limit, windowMs);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
          "Retry-After": Math.ceil(
            (result.reset - Date.now()) / 1000,
          ).toString(),
          "Access-Control-Expose-Headers":
            "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After",
        },
      },
    );
  }

  return null;
}
