// Client-side auth utilities
"use client";

import {
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";

export const useAuth = () => {
  const { data: session, status } = useSession();

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user,
    signIn: nextAuthSignIn,
    signOut: nextAuthSignOut,
  };
};

export type { Session } from "next-auth";
