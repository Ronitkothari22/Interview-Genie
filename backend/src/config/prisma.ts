import { PrismaClient } from "@prisma/client";

import { env } from "@/config/env.js";

/**
 * Single Prisma client for the whole backend.
 * Replaces the three duplicated singletons from the monolith
 * (`src/lib/db.ts`, `src/lib/prisma.ts`, `src/server/db.ts`).
 *
 * The client is cached on globalThis so hot reloads (dev) and multiple
 * import paths reuse one connection pool.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** Alias matching the monolith's `db` naming used across ported code. */
export const db = prisma;