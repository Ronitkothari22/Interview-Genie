import { z } from "zod";

/**
 * Load a local .env file when present (Node >= 20.12/21.7).
 * Falls back silently to real environment variables (e.g. in production/Docker).
 */
try {
  (
    process as NodeJS.Process & { loadEnvFile?: (path?: string) => void }
  ).loadEnvFile?.();
} catch {
  // No .env file — rely on the ambient environment.
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_GEMINI_API: z.string().optional(),

  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),

  CSRF_SECRET: z.string().optional(),
  ATS_API_URL: z.string().url().default("http://23.94.74.248:5000/api/v1/ats-score"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export type Env = typeof env;
