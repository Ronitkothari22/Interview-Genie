import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "@/config/env.js";

/**
 * Create a Gemini generative model. Throws when `GOOGLE_GEMINI_API` is unset so
 * callers can surface a clear error (matching the monolith's behaviour).
 */
export function getGeminiModel() {
  if (!env.GOOGLE_GEMINI_API) {
    throw new Error("GOOGLE_GEMINI_API is not configured");
  }

  const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API);
  return genAI.getGenerativeModel({ model: "gemini-pro" });
}
