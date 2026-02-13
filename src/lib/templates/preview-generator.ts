import { type ResumeData, type TemplateType } from "@/lib/types/resume";

export const sampleData: ResumeData = {
  personalInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    linkedin: "johndoe",
    github: "johndoe",
    location: "San Francisco, CA",
    website: "johndoe.com",
    title: "Senior Software Engineer",
  },
  summary:
    "Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership.",
  experience: [
    {
      company: "Tech Corp",
      position: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "2020-01",
      endDate: "Present",
      description: [
        "Led development of microservices architecture serving 1M+ users",
        "Improved system performance by 40% through optimization",
        "Mentored junior developers and conducted code reviews",
      ],
    },
  ],
  education: [
    {
      school: "University of Technology",
      degree: "Bachelor of Science in Computer Science",
      location: "San Francisco, CA",
      startDate: "2012-09",
      endDate: "2016-05",
      description: [
        "GPA: 3.8/4.0",
        "Dean's List all semesters",
        "Computer Science Club President",
      ],
    },
  ],
  projects: [
    {
      name: "Cloud Migration Platform",
      technologies: "AWS, Kubernetes, Docker",
      date: "2021",
      description: [
        "Developed automated cloud migration tool",
        "Reduced migration time by 60%",
        "Implemented CI/CD pipeline",
      ],
    },
  ],
  skills: {
    technical: ["JavaScript/TypeScript", "React", "Node.js", "Python", "AWS"],
    soft: ["Leadership", "Communication", "Problem Solving"],
    languages: ["English (Native)", "Spanish (Intermediate)"],
  },
  certifications: [
    {
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2022-06",
      description: "Professional level certification",
    },
  ],
  achievements: [
    {
      title: "Innovation Award",
      date: "2021-12",
      description:
        "Received company-wide recognition for innovative cloud migration solution",
    },
  ],
};

export async function generateTemplatePreview(
  template: TemplateType,
): Promise<ResumeData> {
  try {
    // Return sample data for preview
    return sampleData;
  } catch (error) {
    console.error("Error generating template preview:", error);
    throw error;
  }
}
