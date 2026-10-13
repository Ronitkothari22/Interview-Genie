// SHARED — keep in sync with frontend/src/lib/shared/types/resume.ts

/** Shape used by the resume builder / PDF templates. */
export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    location: string;
    website: string;
    title?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    location: string;
    startDate: string;
    endDate: string;
    description?: string[];
  }>;
  projects: Array<{
    name: string;
    technologies: string;
    date: string;
    description: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
  achievements: Array<{
    title: string;
    date: string;
    description: string;
  }>;
}

export type TemplateType = "modern" | "classic" | "minimalist";

/** Response returned by the external ATS microservice. */
export interface ResumeAnalysisResult {
  success: boolean;
  file_url: string;
  ats_analysis: {
    total_score: number;
    section_scores: {
      competencies: number;
      content: number;
      format: number;
      keywords: number;
      language: number;
    };
    detailed_breakdown: {
      competencies_analysis: {
        collaboration: number;
        leadership_initiative: number;
        problem_solving: number;
        results_orientation: number;
      };
      content_analysis: {
        achievements_score: number;
        impact_score: number;
        relevance_score: number;
        technical_depth_score: number;
      };
      format_analysis: {
        bullet_length_score: number;
        bullet_usage_score: number;
        formatting_score: number;
        length_depth_score: number;
        page_density_score: number;
      };
      language_analysis: {
        clarity: number;
        professional_tone: number;
        spelling_grammar: number;
        tense_consistency: number;
        verb_strength: number;
      };
    };
    keyword_match_rate: string;
    missing_keywords: string[];
  };
  improvement_suggestions: {
    high_priority: string[];
    content: Array<{
      current: string;
      impact: string;
      section: string;
      suggested: string;
    }>;
    format: Array<{
      improved: string;
      original: string;
      reason: string;
    }>;
    language: Array<{
      improved: string;
      original: string;
      reason: string;
    }>;
    keywords: string[];
  };
  improvement_details: {
    achievements: unknown[];
    bullet_points: unknown[];
    skills: unknown[];
  };
  metadata: {
    filename: string;
    file_url: string;
    file_path?: string;
    job_description_provided: boolean;
    timestamp: string;
  };
}
