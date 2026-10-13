import cookieParser from "cookie-parser";
import express, { type Express } from "express";

import { corsMiddleware } from "@/middleware/cors.js";
import { errorHandler, notFoundHandler } from "@/middleware/error.js";
import { aiRouter } from "@/routes/ai.js";
import { authRouter } from "@/routes/auth.js";
import { healthRouter } from "@/routes/health.js";
import { practiceRouter } from "@/routes/practice.js";
import { resumeAnalysisRouter } from "@/routes/resume-analysis.js";
import { resumesRouter } from "@/routes/resumes.js";
import { statisticsRouter } from "@/routes/statistics.js";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", true);

  app.use(corsMiddleware);
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/", (_req, res) => {
    res.json({ name: "Interview Genie API", status: "ok" });
  });

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/statistics", statisticsRouter);
  app.use("/api/practice", practiceRouter);
  app.use("/api/resumes", resumesRouter);
  app.use("/api/resume-analysis", resumeAnalysisRouter);
  app.use("/api/ai", aiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
