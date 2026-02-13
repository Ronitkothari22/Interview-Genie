import {
  BookText,
  BriefcaseIcon,
  Star,
  GraduationCap,
  Award,
  Medal,
  Heart,
  Brain,
  FileText,
  CheckCircle,
} from "lucide-react";

export type PersonalFields =
  | "name"
  | "jobTitle"
  | "email"
  | "phone"
  | "location"
  | "linkedIn"
  | "portfolio";
export type ExperienceFields =
  | "companyName"
  | "jobTitle"
  | "startDate"
  | "endDate"
  | "description"
  | "technologies";
export type ProjectFields =
  | "name"
  | "description"
  | "url"
  | "technologies"
  | "startDate"
  | "endDate";
export type EducationFields =
  | "school"
  | "degree"
  | "fieldOfStudy"
  | "startDate"
  | "endDate"
  | "gpa"
  | "achievements";
export type CertificationFields =
  | "name"
  | "issuingOrg"
  | "issueDate"
  | "expiryDate"
  | "credentialId"
  | "credentialUrl";
export type AchievementFields = "title" | "date" | "description";
export type VolunteerFields =
  | "organization"
  | "role"
  | "startDate"
  | "endDate"
  | "description";
export type SkillFields = "technical" | "soft" | "tools";
export type SummaryFields = "content";

export type FieldMap = {
  personal: PersonalFields;
  experience: ExperienceFields;
  projects: ProjectFields;
  education: EducationFields;
  certifications: CertificationFields;
  achievements: AchievementFields;
  volunteering: VolunteerFields;
  skills: SkillFields;
  summary: SummaryFields;
  finish: never;
};

export const tabs = [
  {
    id: "personal",
    label: "Personal",
    icon: BookText,
    required: true,
    requiredFields: ["name", "jobTitle", "email", "phone", "location"] as const,
    optionalFields: ["linkedIn", "portfolio"] as const,
  },
  {
    id: "experience",
    label: "Experience",
    icon: BriefcaseIcon,
    required: true,
    requiredFields: [
      "companyName",
      "jobTitle",
      "startDate",
      "endDate",
      "description",
    ] as const,
    optionalFields: ["technologies"] as const,
  },
  {
    id: "projects",
    label: "Projects",
    icon: Star,
    required: false,
    requiredFields: ["name", "description"] as const,
    optionalFields: ["url", "technologies", "startDate", "endDate"] as const,
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    required: true,
    requiredFields: [
      "school",
      "degree",
      "fieldOfStudy",
      "startDate",
      "endDate",
    ] as const,
    optionalFields: ["gpa", "achievements"] as const,
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: Award,
    required: false,
    requiredFields: ["name", "issuingOrg", "issueDate"] as const,
    optionalFields: ["expiryDate", "credentialId", "credentialUrl"] as const,
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Medal,
    required: false,
    requiredFields: [] as const,
    optionalFields: ["title", "date", "description"] as const,
  },
  {
    id: "skills",
    label: "Skills",
    icon: Brain,
    required: true,
    requiredFields: ["technical"] as const,
    optionalFields: ["soft", "tools"] as const,
  },
  {
    id: "summary",
    label: "Summary",
    icon: FileText,
    required: true,
    requiredFields: ["content"] as const,
    optionalFields: [] as const,
  },
  {
    id: "finish",
    label: "Finish Up",
    icon: CheckCircle,
    required: true,
    requiredFields: [] as const,
    optionalFields: [] as const,
  },
] as const;

export type TabId = (typeof tabs)[number]["id"];

export interface Tab {
  id: TabId;
  label: string;
  icon: any;
  required: boolean;
  requiredFields: readonly string[];
  optionalFields: readonly string[];
}

export const isFieldRequired = <T extends TabId>(
  tabId: T,
  fieldName: keyof FieldMap[T],
): boolean => {
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return false;
  const fields = tab.requiredFields as ReadonlyArray<string>;
  return fields.includes(fieldName as string);
};

export const isFieldOptional = <T extends TabId>(
  tabId: T,
  fieldName: keyof FieldMap[T],
): boolean => {
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return false;
  const fields = tab.optionalFields as ReadonlyArray<string>;
  return fields.includes(fieldName as string);
};

export const getNextTab = (currentTab: TabId): TabId | null => {
  const currentIndex = tabs.findIndex((tab) => tab.id === currentTab);
  if (currentIndex === -1) return null;
  const nextTab = tabs[currentIndex + 1];
  return currentIndex < tabs.length - 1 ? (nextTab?.id ?? null) : null;
};

export const getPreviousTab = (currentTab: TabId): TabId | null => {
  const currentIndex = tabs.findIndex((tab) => tab.id === currentTab);
  if (currentIndex === -1) return null;
  const prevTab = tabs[currentIndex - 1];
  return currentIndex > 0 ? (prevTab?.id ?? null) : null;
};
