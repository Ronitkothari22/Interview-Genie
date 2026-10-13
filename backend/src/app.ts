import cookieParser from "cookie-parser";
import express, { type Express } from "express";

import { corsMiddleware } from "@/middleware/cors.js";
import { errorHandler, notFoundHandler } from "@/middleware/error.js";
import { authRouter } from "@/routes/auth.js";
import { healthRouter } from "@/routes/health.js";

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
