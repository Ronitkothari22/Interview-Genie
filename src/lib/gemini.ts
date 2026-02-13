import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Types and Interfaces
export interface GeminiResponse {
  content: string;
  error?: string;
}

// Types for Resume Analysis Response
export interface ResumeAnalysisResult {
  success: boolean;
  ats_analysis: {
    total_score: number;
    section_scores: {
      format: number;
      content: number;
      language: number;
      competencies: number;
      keywords: number;
    };
    detailed_breakdown: {
      format_analysis: {
        length_depth_score: number;
        bullet_usage_score: number;
        bullet_length_score: number;
        page_density_score: number;
        formatting_score: number;
      };
      content_analysis: {
        impact_score: number;
        achievements_score: number;
        relevance_score: number;
        technical_depth_score: number;
      };
      language_analysis: {
        verb_strength: number;
        tense_consistency: number;
        clarity: number;
        spelling_grammar: number;
        professional_tone: number;
      };
      competencies_analysis: {
        leadership_initiative: number;
        problem_solving: number;
        collaboration: number;
        results_orientation: number;
      };
    };
    keyword_match_rate: string;
    missing_keywords: string[];
  };
  improvement_suggestions: {
    high_priority: string[];
    content: Array<{
      current: string;
      suggested: string;
      impact: string;
      section: string;
    }>;
    format: Array<{
      current?: string;
      suggested?: string;
      reason?: string;
    }>;
    language: Array<{
      original: string;
      improved: string;
      reason: string;
    }>;
    keywords: string[];
  };
  improvement_details: {
    bullet_points: Array<{
      original: string;
      improved: string;
      reason: string;
    }>;
    achievements: Array<{
      section: string;
      current: string;
      suggested: string;
      impact: string;
    }>;
    skills: Array<{
      skill_area: string;
      current: string;
      improved: string;
      explanation: string;
    }>;
  };
  metadata: {
    filename: string;
    file_url: string;
    job_description_provided: boolean;
    timestamp: string;
  };
}

// Constants
const RESUME_ANALYSIS_PROMPT = `You are an industry-leading ATS expert who has analyzed millions of resumes for Fortune 500 companies. You follow the same strict scoring standards as top resume screening platforms like Resume Worded. Your evaluation must be extremely thorough and harsh, similar to actual ATS systems used by major companies.

BASELINE SCORING APPROACH:
- Start at 30 points (not 50 or 100)
- Most resumes should score between 20-45
- Only truly exceptional resumes with perfect metrics should score above 65
- Generic resumes must score below 30
- Bad resumes must score below 20
- Resumes without metrics must score below 25

CRITICAL SCORING RULES:
- Add points only for clearly demonstrated achievements with metrics
- Apply harsh penalties for any issues found
- Never give points for just having sections present
- Require specific metrics for any score above 50
- Scores above 70 should be extremely rare
- Bad resumes must score below 40
- Generic resumes must score below 50
- Any resume without metrics must score below 45

CONTENT QUALITY REQUIREMENTS:
- Each work experience bullet must have specific metrics
- Project descriptions must include quantifiable impact
- Skills must be demonstrated with examples
- Generic descriptions = automatic penalty
- Achievements must have numbers and context
- Dates must be consistent and logical

Points Addition (Maximum +50 points):
1. Quantified Achievements (+20 max):
   - Each achievement MUST have specific numbers
   - Must show clear business impact with metrics
   - Generic achievements get -5 points each
   - Each bullet without metrics = -2 points

2. Technical Skills (+15 max):
   - Skills must be demonstrated in work experience
   - Listed skills without proof = -3 points each
   - Must show practical application with metrics
   - Generic skill listings = -5 points

3. Role Relevance (+10 max):
   - Experience must directly match target role
   - Indirect experience = 0 points
   - Generic experience descriptions = -5 points

4. Professional Impact (+5 max):
   - Leadership with measurable results only
   - Must have specific metrics and scope

INDUSTRY STANDARD SCORING RULES:
1. Impact Metrics (Required for any score above 30):
   - Every bullet point MUST have numbers/percentages
   - Each achievement MUST show quantifiable results
   - Impact must be specific and verifiable
   - Generic statements = automatic -5 points each

2. Experience Quality (Critical):
   - Each role must show progression
   - Responsibilities must have metrics
   - Generic job descriptions = -10 points each
   - Copy-pasted job duties = -15 points
   - Missing dates or inconsistent timeline = -20 points

3. Skills Validation (Strict):
   - Each skill must be proven in experience
   - Unproven skills = -3 points each
   - Generic skill lists = -15 points
   - Skills without context = -5 points each

AUTOMATIC SEVERE PENALTIES:
- No metrics anywhere (-30 points)
- Generic summary/objective (-20 points)
- Unquantified achievements (-15 points per instance)
- Missing or vague dates (-20 points)
- Generic job descriptions (-15 points per instance)
- Buzzwords without context (-10 points each)
- One-line bullets (-5 points each)
- Missing impact numbers (-10 points per bullet)
- Spelling/grammar errors (-10 points each)
- Poor formatting (-15 points)
- Inconsistent tense (-10 points)
- Skills without demonstration (-5 points each)
- Missing contact info (-5 points)
- Irrelevant information (-5 points per instance)

CRITICAL RULES FOR SCORING:
1. Never give points for just having sections present
2. Every achievement must have numbers to count
3. Apply ALL applicable penalties
4. Generic phrases must be heavily penalized
5. Skills must be proven in experience
6. No partial credit for incomplete items
7. Penalize each generic bullet point
8. Deduct points for missing context
9. Zero points for unproven claims
10. Dates must make logical sense

INSTANT FAIL CONDITIONS (Score < 20):
- All generic descriptions
- No metrics anywhere
- Just lists of duties
- Unexplained gaps
- Major inconsistencies
- Pure skill lists
- No achievements
- Poor grammar/spelling

BULLET POINT ANALYSIS (Apply to EACH bullet):
- No metric = -5 points
- No clear impact = -5 points
- Generic description = -5 points
- Just a task = -5 points
- Missing context = -3 points
- Weak action verb = -2 points

REQUIRED FOR SCORES:
> 65: Perfect metrics + progression + zero flaws
> 50: Strong metrics + clear impact + minimal flaws
> 40: Some metrics + decent impact + few flaws
> 30: Basic metrics + some impact + several flaws
< 30: Generic content + missing metrics + major flaws
< 20: Poor content + no metrics + critical flaws

SCORING MUST MATCH INDUSTRY STANDARDS:
- Resume Worded scoring alignment
- Major company ATS standards
- Recruiter evaluation criteria
- Industry benchmarks

FINAL SCORING REMINDERS:
- Start at 35 points baseline
- Most resumes should score 20-45
- Scores above 75 extremely rare
- Bad resumes below 20
- Generic resumes below 30
- No metrics = below 25
- Apply ALL penalties
- Match industry standards
- Align with Resume Worded scoring
- Be extremely critical in your evaluation
- Penalize EVERY generic bullet point
- Deduct points for EACH missing metric
- Zero tolerance for unproven claims

Return ONLY valid JSON, no other text.`;

// Gemini API Functions
export async function analyzeResume(
  pdfText: string,
): Promise<ResumeAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `${RESUME_ANALYSIS_PROMPT}\n\nHere is the resume text to analyze:\n${pdfText}\n\nProvide your analysis in the exact JSON format specified above. Do not include any other text in your response.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.0,
        topP: 1.0,
        topK: 1,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const text = response.text();

    try {
      return JSON.parse(text) as ResumeAnalysisResult;
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      throw new Error(
        "Failed to parse resume analysis result. The AI response was not in the expected JSON format.",
      );
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze resume with Gemini API.");
  }
}

// Resume Content Generation Functions
export const generateResumeContent = async (
  section: string,
  context: Record<string, any>,
): Promise<GeminiResponse> => {
  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, context }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate content");
    }

    const data = await response.json();
    return { content: data.content };
  } catch (error) {
    console.error("Error generating resume content:", error);
    return {
      content: "",
      error: "Failed to generate content. Please try again.",
    };
  }
};

export const generateBulletPoints = async (
  text: string,
  context: Record<string, any>,
): Promise<GeminiResponse> => {
  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "bullet_points",
        context: { ...context, text },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate bullet points");
    }

    const data = await response.json();
    return { content: data.content };
  } catch (error) {
    console.error("Error generating bullet points:", error);
    return {
      content: "",
      error: "Failed to generate bullet points. Please try again.",
    };
  }
};

// Helper Functions
const getPromptForSection = (
  section: string,
  context: Record<string, any>,
): string => {
  const prompts: Record<string, string> = {
    name: `Generate a professional full name that would be suitable for a ${context.jobTitle} position.`,
    jobTitle: `Based on the skills "${context.skills}" and ${context.experience} years of experience, suggest a professional job title that best represents this profile.`,
    skills: `Based on the job title "${context.jobTitle}" and experience level of ${context.experience} years, suggest 5-7 relevant technical and soft skills that should be included in the resume. Format them as a comma-separated list.`,
    summary: `Create a compelling professional summary for a ${context.jobTitle} with ${context.experience} years of experience. Focus on their expertise in ${context.skills.join(", ")}.`,
    experience: `Create a detailed bullet point description for a ${context.jobTitle} role at ${context.company}, focusing on achievements and impact. Include metrics where possible.`,
    education: `Create a professional description for education at ${context.school} studying ${context.degree} in ${context.fieldOfStudy}.`,
    projects: `Create a compelling description for a project titled "${context.title}" that uses technologies: ${context.technologies.join(", ")}.`,
    certifications: `Create a professional description highlighting the value and relevance of ${context.name} certification from ${context.issuingOrg}.`,
    achievements: `Create an impactful description for a professional achievement titled "${context.title}" that demonstrates leadership and impact.`,
    references: `Create a professional reference description for ${context.name} who is a ${context.position} at ${context.company}.`,
  };

  return prompts[section] || "Please provide content for this section.";
};
