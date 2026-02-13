import { z } from "zod";
import { type TabId } from "@/lib/resume-tabs";

// Personal Section
export const personalSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  linkedIn: z.string().optional().or(z.literal("")),
  portfolio: z.string().optional().or(z.literal("")),
});

// Experience Section
export const experienceSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().min(1, "Description is required"),
  technologies: z.array(z.string()).optional(),
});

// Project Section
export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  url: z.string().url("Invalid project URL").optional().or(z.literal("")),
  technologies: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Education Section
export const educationSchema = z.object({
  school: z.string().min(1, "School name is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  gpa: z.string().optional(),
  achievements: z.string().optional(),
});

// Certification Section
export const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  issuingOrg: z.string().min(1, "Issuing organization is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z
    .string()
    .url("Invalid credential URL")
    .optional()
    .or(z.literal("")),
});

// Achievement Section
export const achievementSchema = z.object({
  title: z.string().min(1, "Achievement title is required"),
  date: z.string().min(1, "Achievement date is required"),
  description: z.string().min(1, "Achievement description is required"),
});

// Skills Section
export const skillsSchema = z.object({
  technical: z
    .array(z.string())
    .min(1, "At least one technical skill is required"),
  soft: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
});

// Summary Section
export const summarySchema = z.object({
  content: z.string().min(1, "Summary content is required"),
});

// Remove volunteerSchema
export const resumeSchema = z.object({
  personalInfo: personalSchema.optional(),
  experiences: z.array(experienceSchema).optional(),
  projects: z.array(projectSchema).optional(),
  education: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  skills: skillsSchema.optional(),
  summary: summarySchema.optional(),
});

// Validation function for each section
export function validateSection(section: TabId, data: any) {
  try {
    switch (section) {
      case "personal":
        return { success: true, data: personalSchema.parse(data) };
      case "experience":
        return { success: true, data: z.array(experienceSchema).parse(data) };
      case "projects":
        return { success: true, data: z.array(projectSchema).parse(data) };
      case "education":
        return { success: true, data: z.array(educationSchema).parse(data) };
      case "certifications":
        return {
          success: true,
          data: z.array(certificationSchema).parse(data),
        };
      case "achievements":
        return { success: true, data: z.array(achievementSchema).parse(data) };
      case "skills":
        return { success: true, data: skillsSchema.parse(data) };
      case "summary":
        return { success: true, data: summarySchema.parse(data) };
      default:
        return { success: false, error: "Invalid section" };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return { success: false, error: "Validation failed", errors };
    }
    return { success: false, error: "Unknown validation error" };
  }
}

// Remove volunteering from isSectionComplete function
export function isSectionComplete(section: string, data: any): boolean {
  try {
    switch (section) {
      case "personal":
        return personalSchema.safeParse(data).success;
      case "experience":
        return z.array(experienceSchema).safeParse(data).success;
      case "projects":
        return z.array(projectSchema).safeParse(data).success;
      case "education":
        return z.array(educationSchema).safeParse(data).success;
      case "certifications":
        return z.array(certificationSchema).safeParse(data).success;
      case "achievements":
        if (!Array.isArray(data) || data.length === 0) {
          console.log("Achievements validation failed: No achievements found");
          return false;
        }
        const isValid = data.every(
          (achievement) =>
            achievement?.title?.trim() !== "" &&
            achievement?.date?.trim() !== "" &&
            achievement?.description?.trim() !== "",
        );
        console.log("Achievements validation result:", isValid);
        return isValid;
      case "skills":
        console.log("Checking skills completion:", data);
        if (!data?.technical || !Array.isArray(data.technical)) {
          console.log(
            "Skills validation failed: technical skills array is missing or invalid",
          );
          return false;
        }
        const hasSkills = data.technical.length > 0;
        console.log(
          "Skills validation result:",
          hasSkills,
          "Technical skills:",
          data.technical,
        );
        return hasSkills;
      case "summary":
        return summarySchema.safeParse(data).success;
      default:
        return false;
    }
  } catch (error) {
    console.error("Validation error:", error);
    return false;
  }
}
