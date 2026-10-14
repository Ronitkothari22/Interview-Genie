"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { API_URL, apiRequest } from "@/lib/api-client";
import type { Session, SessionUser } from "@/lib/shared/types/session";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface SignInOptions {
  email?: string;
  password?: string;
  callbackUrl?: string;
}

export interface AuthContextValue {
  session: Session | null;
  user: SessionUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (
    provider: "credentials" | "google" | (string & {}),
    options?: SignInOptions,
  ) => Promise<{ error?: string }>;
  signOut: (options?: { callbackUrl?: string }) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  initialSession = null,
}: {
  children: React.ReactNode;
  initialSession?: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [status, setStatus] = useState<AuthStatus>(
    initialSession?.user ? "authenticated" : "loading",
  );

  const refresh = useCallback(async () => {
    try {
      const data = await apiRequest<Session>("/api/auth/session");
      setSession(data?.user ? data : null);
      setStatus(data?.user ? "authenticated" : "unauthenticated");
    } catch {
      setSession(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (provider, options = {}) => {
      if (provider === "credentials") {
        try {
          await apiRequest("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: options.email,
              password: options.password,
            }),
          });
          await refresh();
          return {};
        } catch (error) {
          return {
            error:
              error instanceof Error
                ? error.message
                : "Invalid email or password",
          };
        }
      }

      // OAuth / other providers: full-page redirect to the backend.
      const query = options.callbackUrl
        ? `?callbackUrl=${encodeURIComponent(options.callbackUrl)}`
        : "";
      window.location.href = `${API_URL}/api/auth/${provider}${query}`;
      return {};
    },
    [refresh],
  );

  const signOut = useCallback<AuthContextValue["signOut"]>(
    async (options = {}) => {
      try {
        await apiRequest("/api/auth/logout", { method: "POST" });
      } catch {
        // Ignore — clearing the client state below is best-effort.
      }
      setSession(null);
      setStatus("unauthenticated");
      window.location.href = options.callbackUrl ?? "/login";
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      status,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      signIn,
      signOut,
      refresh,
    }),
    [session, status, signIn, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
