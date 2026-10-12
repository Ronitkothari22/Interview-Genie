import cors from "cors";

import { env } from "@/config/env.js";

/**
 * CORS for the browser frontend. `credentials: true` is required so the
 * auth cookie is sent/accepted cross-origin.
 */
export const corsMiddleware = cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
