import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

function initPrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });
}

// Use regular Node.js global caching
const prisma = global.cachedPrisma ?? initPrisma();

if (process.env.NODE_ENV !== "production") {
  global.cachedPrisma = prisma;
}

export const db = prisma;
