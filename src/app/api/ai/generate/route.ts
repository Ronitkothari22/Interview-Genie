import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";

// Initialize Gemini on the server side
const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const RESUME_EXPERT_PROMPT = `You are an expert resume writer. Enhance the given text with proper grammar and professional tone. 
Keep the original meaning but make it more impactful.
If no text is provided, write a new concise description.
Use simple text without bullet points, dashes, or any special characters.`;

function getPromptForSection(
  section: string,
  context: Record<string, any>,
): string {
  // Ensure context is not undefined
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

export async function POST(req: Request) {
  try {
    const { section, context } = await req.json();

    const prompt = getPromptForSection(section, context);
    const result = await model.generateContent(
      RESUME_EXPERT_PROMPT + "\n\n" + prompt,
    );
    const response = result.response;

    return NextResponse.json({ content: response.text() });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content. Please try again." },
      { status: 500 },
    );
  }
}
