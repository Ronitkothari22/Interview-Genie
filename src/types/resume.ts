export interface SectionScores {
  format: number;
  content: number;
  language: number;
  competencies: number;
  keywords: number;
}

export interface FormatAnalysis {
  length_depth_score: number;
  bullet_usage_score: number;
  bullet_length_score: number;
  page_density_score: number;
  formatting_score: number;
}

export interface ContentAnalysis {
  impact_score: number;
  achievements_score: number;
  relevance_score: number;
  technical_depth_score: number;
}

export interface LanguageAnalysis {
  verb_strength: number;
  tense_consistency: number;
  clarity: number;
  spelling_grammar: number;
  professional_tone: number;
}

export interface CompetenciesAnalysis {
  leadership_initiative: number;
  problem_solving: number;
  collaboration: number;
  results_orientation: number;
}

export interface DetailedBreakdown {
  format_analysis: FormatAnalysis;
  content_analysis: ContentAnalysis;
  language_analysis: LanguageAnalysis;
  competencies_analysis: CompetenciesAnalysis;
}

export interface ImprovementSuggestion {
  current?: string;
  suggested?: string;
  impact?: string;
  section?: string;
  reason?: string;
}

export interface ImprovementDetails {
  bullet_points: ImprovementSuggestion[];
  achievements: ImprovementSuggestion[];
  skills: ImprovementSuggestion[];
}

export interface ImprovementSuggestions {
  high_priority: string[];
  content: ImprovementSuggestion[];
  format: ImprovementSuggestion[];
  language: ImprovementSuggestion[];
  keywords: string[];
}

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
    achievements: any[];
    bullet_points: any[];
    skills: any[];
  };
  metadata: {
    filename: string;
    file_url: string;
    file_path?: string;
    job_description_provided: boolean;
    timestamp: string;
  };
}

export interface StoredResumeAnalysis {
  id: string;
  userId: string;
  originalFilename: string;
  fileUrl: string;
  totalScore: number;
  sectionScores: SectionScores;
  detailedBreakdown: DetailedBreakdown;
  keywordMatchRate: string;
  missingKeywords: string[];
  improvementSuggestions: ImprovementSuggestions;
  improvementDetails: ImprovementDetails;
  createdAt: string;
  updatedAt: string;
} 