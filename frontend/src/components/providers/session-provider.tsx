"use client";

import { AuthProvider } from "@/providers/auth-provider";
import type { Session } from "@/lib/shared/types/session";

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return <AuthProvider initialSession={session}>{children}</AuthProvider>;
}
