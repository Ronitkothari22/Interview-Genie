import { apiFetch } from "@/lib/api-client";

export interface GeminiResponse {
  content: string;
  error?: string;
}

/**
 * Generate/enhance a resume section via the backend AI route
 * (`POST /api/ai/generate`). Mirrors the old server-side `generateResumeContent`
 * signature so call sites stay unchanged.
 */
export async function generateResumeContent(
  section: string,
  context: Record<string, unknown>,
): Promise<GeminiResponse> {
  try {
    const response = await apiFetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, context }),
    });

    if (!response.ok) {
      return {
        content: "",
        error: "Failed to generate content. Please try again.",
      };
    }

    const data = (await response.json()) as { content?: string };
    return { content: data.content ?? "" };
  } catch {
    return {
      content: "",
      error: "Failed to generate content. Please try again.",
    };
  }
}
