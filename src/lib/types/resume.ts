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
