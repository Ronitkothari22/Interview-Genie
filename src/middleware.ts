import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "./env";

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/auth",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/verify-otp",
  "/api/trpc",
  "/api/webhooks",
];

// Paths that should redirect to dashboard if authenticated
const authPaths = ["/login", "/register", "/verify-otp"];

type CacheConfig = {
  public?: boolean;
  private?: boolean;
  maxAge: number;
  staleWhileRevalidate?: number;
  noStore?: boolean;
};

// Cache configuration for different API routes
const API_CACHE_CONFIG: Record<string, CacheConfig> = {
  "/api/statistics": {
    public: true,
    maxAge: 10,
    staleWhileRevalidate: 59,
  },
  "/api/resumes/templates": {
    public: true,
    maxAge: 3600,
    staleWhileRevalidate: 86400,
  },
  "/api/practice": {
    private: true,
    maxAge: 0,
    noStore: true,
  },
} as const;

export const runtime = "nodejs";

function getCacheControlHeader(pathname: string): string {
  // Check if the path matches any of our cache configs
  for (const [route, config] of Object.entries(API_CACHE_CONFIG)) {
    if (pathname.startsWith(route)) {
      if (config.noStore) {
        return "no-cache, no-store, must-revalidate";
      }

      const directives = [];
      if (config.public) {
        directives.push("public");
      } else if (config.private) {
        directives.push("private");
      }

      if (config.maxAge) {
        directives.push(`s-maxage=${config.maxAge}`);
      }

      if (config.staleWhileRevalidate) {
        directives.push(
          `stale-while-revalidate=${config.staleWhileRevalidate}`,
        );
      }

      return directives.join(", ");
    }
  }

  // Default to no caching for API routes
  return "no-cache, no-store, must-revalidate";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clean and normalize the pathname
  const cleanPathname = decodeURIComponent(pathname).trim();

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) => cleanPathname.startsWith(path) || cleanPathname === path,
  );

  // Check if it's an auth path (login, register, etc.)
  const isAuthPath = authPaths.some(
    (path) => cleanPathname.startsWith(path) || cleanPathname === path,
  );

  try {
    const token = await getToken({
      req: request,
      secret: env.NEXTAUTH_SECRET,
    });

    // For auth paths (login, register), redirect to dashboard if already authenticated
    if (isAuthPath && token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // For protected paths, check authentication
    if (!isPublicPath && !token) {
      // Store the original URL as the callback URL
      const callbackUrl = cleanPathname;
      const response = NextResponse.redirect(new URL("/login", request.url));
      
      // Set callback URL in cookie
      response.cookies.set("next-auth.callback-url", callbackUrl, {
        path: "/",
      });

      return response;
    }

    // Allow the request to proceed
    const response = NextResponse.next();

    // Add cache control headers for API routes
    if (cleanPathname.startsWith("/api/")) {
      response.headers.set("Cache-Control", getCacheControlHeader(cleanPathname));
    }

    return response;
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
