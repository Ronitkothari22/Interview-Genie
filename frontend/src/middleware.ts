import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route guard based on the presence of the backend session cookie.
 *
 * Actual session verification happens on the backend (`GET /api/auth/session`).
 * This middleware only performs cheap redirects so unauthenticated users don't
 * briefly render protected pages.
 */

const SESSION_COOKIE_NAME = "ig_session";

// Paths that don't require authentication (exact match for "/", prefix match otherwise).
const publicPaths = [
  "/",
  "/login",
  "/signup",
  "/register",
  "/auth",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
  "/_next",
  "/favicon.ico",
];

// Paths that should redirect to the dashboard when already authenticated.
const authPaths = ["/login", "/signup", "/register", "/verify-otp"];

function matchesPath(pathname: string, candidates: string[]): boolean {
  return candidates.some((path) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cleanPathname = decodeURIComponent(pathname).trim();

  const isPublicPath = matchesPath(cleanPathname, publicPaths);
  const isAuthPath = matchesPath(cleanPathname, authPaths);
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  if (isAuthPath && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", cleanPathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
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
