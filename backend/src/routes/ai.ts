import { Router } from "express";

import { getGeminiModel } from "@/services/gemini.js";
import type { ResumeAnalysisResult } from "@/shared/types/resume.js";

export const aiRouter = Router();

/**
 * POST /api/ai/analyze — analyze raw resume data with Gemini.
 *
 * Ported faithfully: the monolith declared a verbose scoring prompt but called
 * `generateContent(resumeData)` directly, so the prompt was unused. That
 * behaviour is preserved here (the dead prompt is omitted).
 */
aiRouter.post("/analyze", async (req, res) => {
  try {
    const model = getGeminiModel();
    const { resumeData } = (req.body ?? {}) as { resumeData: string };

    const result = await model.generateContent(resumeData);
    const text = result.response.text();

    try {
      const analysis = JSON.parse(text) as ResumeAnalysisResult;
      res.json(analysis);
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      res.status(500).send("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    res.status(500).send("Failed to analyze resume");
  }
});

const RESUME_EXPERT_PROMPT = `You are an expert resume writer. Enhance the given text with proper grammar and professional tone. 
Keep the original meaning but make it more impactful.
If no text is provided, write a new concise description.
Use simple text without bullet points, dashes, or any special characters.`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function getPromptForSection(
  section: string,
  context: Record<string, any>,
): string {
  context = context || {};

  const prompts: Record<string, string> = {
    summary: `Enhance this professional summary (or write a new one if empty): "${context.existingContent || ""}"
    Context: ${context.jobTitle || "professional"} with ${context.experience || ""} years of experience in ${Array.isArray(context.skills?.technical) ? context.skills.technical.join(", ") : "relevant skills"}.
    Keep under 50 words and use plain text without special characters.`,

    experience_description: `Enhance this experience description (or write a new one if empty): "${context.description || ""}"
    Context: ${context.title || ""} role at ${context.company || ""}.
    Keep under 30 words and use plain text without special characters.`,

    project_description: `Enhance this project description (or write a new one if empty): "${context.description || ""}"
    Context: Project "${context.title || ""}" using ${context.technologies || ""}.
    Keep under 30 words and use plain text without special characters.`,

    achievement_description: `Enhance this achievement description (or write a new one if empty): "${context.description || ""}"
    Context: Achievement "${context.title || ""}" at ${context.company || ""}.
    Keep under 25 words and use plain text without special characters.`,

    volunteer_description: `Enhance this volunteer description (or write a new one if empty): "${context.description || ""}"
    Context: ${context.role || ""} role at ${context.organization || ""}.
    Keep under 25 words and use plain text without special characters.`,
  };

  return prompts[section] ?? "Please provide content for this section.";
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** POST /api/ai/generate — enhance/write a resume section with Gemini. */
aiRouter.post("/generate", async (req, res) => {
  try {
    const model = getGeminiModel();
    const { section, context } = req.body ?? {};

    const prompt = getPromptForSection(section, context);
    const result = await model.generateContent(
      RESUME_EXPERT_PROMPT + "\n\n" + prompt,
    );

    res.json({ content: result.response.text() });
  } catch (error) {
    console.error("Error generating content:", error);
    res
      .status(500)
      .json({ error: "Failed to generate content. Please try again." });
  }
});
