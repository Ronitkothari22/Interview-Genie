import { Router } from "express";

export const healthRouter = Router();

/**
 * Liveness/readiness probe. Phase 1 returns a static status; later phases
 * extend this with database + cache checks.
 */
healthRouter.get("/", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});
