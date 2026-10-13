// SHARED — keep in sync with frontend/src/lib/shared/types/session.ts

/** Minimal authenticated user shape shared between backend and frontend. */
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  credits: number;
  subscriptionStatus: string;
  isVerified: boolean;
}

/** Payload returned by `GET /api/auth/session`. */
export interface Session {
  user: SessionUser | null;
  expires: string;
}
