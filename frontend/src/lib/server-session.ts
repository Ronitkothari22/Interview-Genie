import { cookies } from "next/headers";

import { API_URL } from "@/lib/api-client";
import type { Session } from "@/lib/shared/types/session";

/**
 * Server-side session lookup. Forwards the incoming cookies to the backend
 * session endpoint and returns the parsed session (or null).
 *
 * Safe to call from Server Components / Server Actions. Never throws.
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    if (!cookieHeader) {
      return null;
    }

    const response = await fetch(`${API_URL}/api/auth/session`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Session;
    return data?.user ? data : null;
  } catch {
    return null;
  }
}
