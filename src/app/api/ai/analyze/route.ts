import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";
import type { ResumeAnalysisResult } from "@/lib/gemini";

// Initialize Gemini on the server side
const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API);

const ATS_ANALYSIS_PROMPT = `
Analyze this resume with balanced but strict scoring criteria. Provide constructive feedback while acknowledging strengths.
A well-crafted resume should be able to achieve a score between 70-85%, with exceptional resumes potentially scoring higher.

Scoring Criteria (Balanced but Strict):

1. Format & Structure (20 points):
   - Length & depth (0-4): Standard 1-2 pages acceptable, -1 for excess
   - Use of bullets (0-4): Clear bullet points with action verbs
   - Bullet lengths (0-4): 1-2 lines optimal, clear and concise
   - Page density (0-4): Balanced white space and content
   - Overall formatting (0-4): Consistent fonts and spacing

2. Content Quality (20 points):
   - Quantified impact (0-5): Numbers and metrics where applicable
   - Specific achievements (0-5): Clear accomplishments over duties
   - Relevance to field (0-5): Industry-aligned experience
   - Technical depth (0-5): Appropriate technical detail

3. Language & Communication (20 points):
   - Verb strength (0-4): Strong action verbs
   - Verb tense consistency (0-4): Proper past/present usage
   - Clarity (0-4): Clear, professional language
   - Spelling & grammar (0-4): Minimal errors acceptable
   - Professional tone (0-4): Appropriate business language

4. Core Competencies (20 points):
   - Leadership/Initiative (0-5): Shows proactive approach
   - Problem-solving (0-5): Demonstrates analytical thinking
   - Collaboration (0-5): Shows team and communication skills
   - Results-orientation (0-5): Focus on outcomes

5. Keywords & Industry Alignment (20 points):
   - Industry-specific terms (0-7): Relevant current technologies
   - Role-specific keywords (0-7): Matching job requirements
   - Soft skills alignment (0-6): Balanced technical and soft skills

Please analyze the resume and provide a detailed response in the following JSON format:
{
  "ats_analysis": {
    "total_score": <number between 0-100>,
    "section_scores": {
      "format": <number between 0-20>,
      "content": <number between 0-20>,
      "language": <number between 0-20>,
      "competencies": <number between 0-20>,
      "keywords": <number between 0-20>
    },
    "detailed_breakdown": {
      "format_analysis": {
        "length_depth_score": <number>,
        "bullet_usage_score": <number>,
        "bullet_length_score": <number>,
        "page_density_score": <number>,
        "formatting_score": <number>
      },
      "content_analysis": {
        "impact_score": <number>,
        "achievements_score": <number>,
        "relevance_score": <number>,
        "technical_depth_score": <number>
      },
      "language_analysis": {
        "verb_strength": <number>,
        "tense_consistency": <number>,
        "clarity": <number>,
        "spelling_grammar": <number>,
        "professional_tone": <number>
      },
      "competencies_analysis": {
        "leadership_initiative": <number>,
        "problem_solving": <number>,
        "collaboration": <number>,
        "results_orientation": <number>
      }
    },
    "keyword_match_rate": <string>,
    "missing_keywords": <array of strings>
  },
  "improvement_suggestions": {
    "high_priority": <array of most important improvements needed>,
    "content": <array of specific content improvements>,
    "language": <array of language improvements>,
    "format": <array of formatting improvements>,
    "keywords": <array of keyword suggestions>
  },
  "improvement_details": {
    "bullet_points": [
      {
        "original": <string>,
        "improved": <string>,
        "reason": <string>
      }
    ],
    "achievements": [
      {
        "section": <string>,
        "current": <string>,
        "suggested": <string>,
        "impact": <string>
      }
    ],
    "skills": [
      {
        "skill_area": <string>,
        "current": <string>,
        "improved": <string>,
        "explanation": <string>
      }
    ]
  }
}`;

export async function POST(req: Request) {
  try {
    const { resumeData } = (await req.json()) as { resumeData: string };

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(resumeData);
    const response = result.response;
    const text = response.text();

    try {
      const analysis = JSON.parse(text) as ResumeAnalysisResult;
      return NextResponse.json(analysis);
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      return new NextResponse("Invalid response format from Gemini", {
        status: 500,
      });
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return new NextResponse("Failed to analyze resume", { status: 500 });
  }
}
