"use client";

/**
 * Client-side auth helpers. Thin re-export over the AuthProvider so existing
 * `useAuth()` call sites keep working after the move to backend auth.
 */

export { useAuth } from "@/providers/auth-provider";
export type {
  AuthContextValue,
  AuthStatus,
  SignInOptions,
} from "@/providers/auth-provider";
export type { Session, SessionUser } from "@/lib/shared/types/session";
