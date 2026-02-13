"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { generateResumeContent } from "@/lib/gemini";
import { toast } from "sonner";
import {
  BookText,
  BriefcaseIcon,
  GraduationCap,
  Award,
  Brain,
  Star,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Plus,
  Trash2,
  ExternalLink,
  Medal,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SkillsInput } from "@/components/ui/skills-input";
import { useSaveResume } from "@/hooks/use-save-resume";
import { isSectionComplete } from "@/lib/validations/resume";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionNavigation } from "@/components/resume/section-navigation";
import { TemplateSelector } from "@/components/resume/template-selector";
import { type TemplateType } from "@/lib/types/resume";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// Add this type definition before the tabs array
interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
}

const tabs: TabItem[] = [
  {
    id: "personal",
    label: "Personal",
    icon: BookText,
    required: true,
  },
  {
    id: "experience",
    label: "Experience",
    icon: BriefcaseIcon,
    required: false,
  },
  {
    id: "projects",
    label: "Projects",
    icon: Star,
    required: false,
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    required: true,
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: Award,
    required: false,
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Medal,
    required: false,
  },
  {
    id: "skills",
    label: "Skills",
    icon: Brain,
    required: false,
  },
  {
    id: "summary",
    label: "Summary",
    icon: FileText,
    required: false,
  },
  {
    id: "finish",
    label: "Finish Up",
    icon: CheckCircle,
    required: true,
  },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  linkedIn: string;
  github: string;
  location: string;
  portfolio: string;
  jobTitle: string;
  summary: string;
  experiences: Record<
    string,
    {
      companyName: string;
      jobTitle: string;
      location: string;
      startDate: string;
      endDate: string;
      description: string;
      technologies: string[];
    }
  >;
  education: Record<
    string,
    {
      school: string;
      degree: string;
      fieldOfStudy: string;
      location: string;
      startDate: string;
      endDate: string;
      achievements: string[];
      gpa?: string;
    }
  >;
  projects: Record<
    string,
    {
      name: string;
      technologies: string[];
      startDate: string;
      endDate: string;
      description: string;
      url?: string;
    }
  >;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  certifications: Record<
    string,
    {
      name: string;
      issuingOrg: string;
      issueDate: string;
      expiryDate?: string;
      credentialId: string;
      credentialUrl?: string;
    }
  >;
  achievements: Record<
    string,
    {
      title: string;
      date: string;
      description: string;
    }
  >;
}

interface AIGenerateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
  fullWidth?: boolean;
}

function AIGenerateButton({
  onClick,
  isLoading = false,
  label = "Generate Description",
  fullWidth = true,
}: AIGenerateButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "group hover:border-primary/50",
        fullWidth ? "w-full" : "min-w-[200px]",
      )}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="relative h-4 w-4">
            <div className="absolute inset-0">
              <div className="h-full w-full animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          </div>
          <span>Generating...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span>{label}</span>
        </div>
      )}
    </Button>
  );
}

// Update LoadingSkeleton component for better mobile experience
function LoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-[24rem]" />
      </div>

      <Card>
        <div className="border-b p-2 sm:p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-[24rem]" />
          </div>

          <Card className="p-3 sm:p-4">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}

// Update InitialLoadingState component for better mobile experience
function InitialLoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0">
            <div className="h-full w-full animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Loading Resume</h3>
          <p className="text-sm text-muted-foreground">Please wait while we load your resume data...</p>
        </div>
      </div>
    </div>
  );
}

// Add degree options constant
const degreeOptions = [
  "B.Tech",
  "B.E.",
  "B.Sc",
  "B.A",
  "B.Com",
  "BBA",
  "BCA",
  "M.Tech",
  "M.E.",
  "M.Sc",
  "M.A",
  "M.Com",
  "MBA",
  "MCA",
  "Ph.D",
  "Other",
];

// Update the MobileTabNavigation component with proper types
function MobileTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  completedSections,
}: {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  completedSections: Record<string, boolean>;
}) {
  const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const showLeftArrow = currentIndex > 0;
  const showRightArrow = currentIndex < tabs.length - 1;

  const handlePrevious = () => {
    const previousTab = tabs[currentIndex - 1];
    if (currentIndex > 0 && previousTab) {
      onTabChange(previousTab.id);
    }
  };

  const handleNext = () => {
    const nextTab = tabs[currentIndex + 1];
    if (currentIndex < tabs.length - 1 && nextTab) {
      onTabChange(nextTab.id);
    }
  };

  // Add a fallback tab in case the current tab is not found
  const currentTab = tabs[currentIndex] || tabs[0];

  // If no valid tab is found, don't render anything
  if (!currentTab) return null;

  return (
    <div className="flex items-center justify-between gap-2 md:hidden">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={!showLeftArrow}
        className={cn(
          "h-10 w-10 shrink-0 transition-opacity",
          !showLeftArrow && "opacity-0"
        )}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <TabsList className="flex-1 bg-transparent p-0">
        <TabsTrigger
          value={currentTab.id}
          className={cn(
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "group flex w-full items-center justify-center gap-2 py-2 transition-all",
            "hover:bg-primary/10",
            "rounded-md"
          )}
        >
          <currentTab.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span>{currentTab.label}</span>
          {currentTab.required && <span className="text-[10px] text-red-500">*</span>}
          {completedSections[currentTab.id] && (
            <CheckCircle className="h-3 w-3 text-green-500" />
          )}
        </TabsTrigger>
      </TabsList>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={!showRightArrow}
        className={cn(
          "h-10 w-10 shrink-0 transition-opacity",
          !showRightArrow && "opacity-0"
        )}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function ResumeEditorPage() {
  const params = useParams();
  const resumeId = params.id as string;
  const [activeTab, setActiveTab] = useState("personal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<Record<string, boolean>>(
    {},
  );
  const [experiences, setExperiences] = useState([{ id: 1 }]);
  const [projects, setProjects] = useState([{ id: 1 }]);
  const [education, setEducation] = useState([{ id: 1 }]);
  const [certifications, setCertifications] = useState([{ id: 1 }]);
  const [achievements, setAchievements] = useState([{ id: 1 }]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>("modern");
  const [resumeTitle, setResumeTitle] = useState("");
  const router = useRouter();

  // Add form data state for each section
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    linkedIn: "",
    github: "",
    location: "",
    portfolio: "",
    jobTitle: "",
    summary: "",
    experiences: {},
    projects: {},
    education: {},
    certifications: {},
    achievements: {},
    skills: {
      technical: [],
      soft: [],
      languages: [],
    },
  });

  const [completedSections, setCompletedSections] = useState<
    Record<string, boolean>
  >({
    personal: false,
    experience: false,
    projects: false,
    education: false,
    certifications: false,
    achievements: false,
    skills: false,
    summary: false,
  });

  const { isSaving, validationErrors, saveSection } = useSaveResume(resumeId);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setIsInitialLoading(true);
        const response = await fetch(`/api/resumes/${resumeId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch resume data");
        }
        const data = await response.json();

        console.log("Fetched resume data:", data); // Debug log

        // Update form data with fetched resume data
        setFormData((prevState) => ({
          ...prevState,
          name: data.personalInfo?.fullName || "",
          jobTitle: data.personalInfo?.jobTitle || "",
          email: data.personalInfo?.email || "",
          phone: data.personalInfo?.phone || "",
          location: data.personalInfo?.location || "",
          linkedIn: data.personalInfo?.linkedIn || "",
          portfolio: data.personalInfo?.portfolio || "",
          summary: data.summary?.content || "",
          experiences:
            data.experiences?.reduce((acc: any, exp: any) => {
              acc[exp.id] = {
                companyName: exp.companyName,
                jobTitle: exp.jobTitle,
                startDate: exp.startDate,
                endDate: exp.endDate,
                description: exp.description,
                technologies: Array.isArray(exp.technologies)
                  ? exp.technologies
                  : typeof exp.technologies === "string"
                    ? exp.technologies
                        .split(",")
                        .map((t: string) => t.trim())
                        .filter(Boolean)
                    : [],
              };
              return acc;
            }, {}) || {},
          projects:
            data.projects?.reduce((acc: any, proj: any) => {
              acc[proj.id] = {
                name: proj.name,
                url: proj.url,
                startDate: proj.startDate,
                endDate: proj.endDate,
                description: proj.description,
                technologies: Array.isArray(proj.technologies)
                  ? proj.technologies
                  : typeof proj.technologies === "string"
                    ? proj.technologies
                        .split(",")
                        .map((t: string) => t.trim())
                        .filter(Boolean)
                    : [],
              };
              return acc;
            }, {}) || {},
          education:
            data.education?.reduce((acc: any, edu: any) => {
              acc[edu.id] = {
                school: edu.school,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy,
                gpa: edu.gpa,
                startDate: edu.startDate,
                endDate: edu.endDate,
                achievements: edu.achievements,
              };
              return acc;
            }, {}) || {},
          certifications:
            data.certifications?.reduce((acc: any, cert: any) => {
              acc[cert.id] = {
                name: cert.name,
                issuingOrg: cert.issuingOrg,
                issueDate: cert.issueDate,
                expiryDate: cert.expiryDate,
                credentialId: cert.credentialId,
                credentialUrl: cert.credentialUrl,
              };
              return acc;
            }, {}) || {},
          achievements:
            data.achievements?.reduce((acc: any, ach: any) => {
              acc[ach.id] = {
                title: ach.title,
                date: ach.date,
                description: ach.description,
              };
              return acc;
            }, {}) || {},
          skills: {
            technical: Array.isArray(data.skills?.technical)
              ? data.skills.technical
              : [],
            soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
            languages: Array.isArray(data.skills?.languages)
              ? data.skills.languages
              : [],
          },
        }));

        // Update section items with the correct IDs
        if (data.experiences?.length)
          setExperiences(data.experiences.map((exp: any) => ({ id: exp.id })));
        if (data.projects?.length)
          setProjects(data.projects.map((proj: any) => ({ id: proj.id })));
        if (data.education?.length)
          setEducation(data.education.map((edu: any) => ({ id: edu.id })));
        if (data.certifications?.length)
          setCertifications(
            data.certifications.map((cert: any) => ({ id: cert.id })),
          );
        if (data.achievements?.length)
          setAchievements(
            data.achievements.map((ach: any) => ({ id: ach.id })),
          );

        // Update completion status
        const newCompletedSections = { ...completedSections };
        if (data.personalInfo?.fullName) newCompletedSections.personal = true;
        if (data.experiences?.length) newCompletedSections.experience = true;
        if (
          data.projects?.length &&
          data.projects.every(
            (proj: {
              name: string;
              startDate: string;
              endDate: string;
              description: string;
            }) =>
              proj.name && proj.startDate && proj.endDate && proj.description,
          )
        )
          newCompletedSections.projects = true;
        if (
          data.certifications?.length &&
          data.certifications.every(
            (cert: { name: string; issuingOrg: string; issueDate: string }) =>
              cert.name && cert.issuingOrg && cert.issueDate,
          )
        )
          newCompletedSections.certifications = true;
        if (data.education?.length) newCompletedSections.education = true;
        if (data.skills?.technical?.length > 0)
          newCompletedSections.skills = true;
        if (data.summary?.content) newCompletedSections.summary = true;
        if (
          data.achievements?.length &&
          data.achievements.every(
            (ach: { title: string; date: string; description: string }) =>
              ach.title && ach.date && ach.description,
          )
        )
          newCompletedSections.achievements = true;
        setCompletedSections(newCompletedSections);
      } catch (error) {
        console.error("Error fetching resume data:", error);
        toast.error("Failed to load resume data. Please try again.");
      } finally {
        setIsInitialLoading(false);
        setLoading(false);
      }
    };

    if (resumeId) {
      void fetchResumeData();
    }
  }, [resumeId]);

  const handleGenerateAI = async (
    section: string,
    id: number,
    field: string,
  ) => {
    setIsGeneratingAI({
      ...isGeneratingAI,
      [`${section}-${id}-${field}`]: true,
    });
    try {
      let context = {};

      // Build context based on section
      switch (section) {
        case "summary":
          context = {
            jobTitle: formData.jobTitle,
            experience: formData.experiences
              ? Object.keys(formData.experiences).length
              : 0,
            skills: formData.skills,
            existingContent: formData.summary || "",
          };
          break;
        case "experience_description":
          context = {
            title: formData.experiences[id]?.jobTitle,
            company: formData.experiences[id]?.companyName,
            technologies:
              formData.experiences[id]?.technologies?.join(", ") ?? "",
            description: formData.experiences[id]?.description ?? "",
          };
          break;
        case "project_description":
          context = {
            title: formData.projects[id]?.name,
            technologies: formData.projects[id]?.technologies?.join(", ") ?? "",
            description: formData.projects[id]?.description ?? "",
          };
          break;
        case "achievement_description":
          // Handle both education achievements and general achievements
          if (field === "achievements") {
            context = {
              school: formData.education[id]?.school,
              degree: formData.education[id]?.degree,
              fieldOfStudy: formData.education[id]?.fieldOfStudy,
              description: formData.education[id]?.achievements ?? "",
            };
          } else {
            context = {
              title: formData.achievements[id]?.title,
              company: formData.experiences
                ? Object.values(formData.experiences)[0]?.companyName
                : undefined,
              description: formData.achievements[id]?.description ?? "",
            };
          }
          break;
      }

      const response = await generateResumeContent(section, context);

      if (response.content) {
        setFormData((prev: FormState) => {
          switch (section) {
            case "summary":
              return {
                ...prev,
                summary: response.content,
              };
            case "experience_description":
              return {
                ...prev,
                experiences: {
                  ...prev.experiences,
                  [id]: {
                    ...prev.experiences[id],
                    description: response.content,
                  },
                },
              };
            case "project_description":
              return {
                ...prev,
                projects: {
                  ...prev.projects,
                  [id]: {
                    ...prev.projects[id],
                    description: response.content,
                  },
                },
              };
            case "achievement_description":
              // Handle both education achievements and general achievements
              if (field === "achievements") {
                return {
                  ...prev,
                  education: {
                    ...prev.education,
                    [id]: {
                      ...prev.education[id],
                      achievements: response.content,
                    },
                  },
                };
              }
              return {
                ...prev,
                achievements: {
                  ...prev.achievements,
                  [id]: {
                    ...prev.achievements[id],
                    description: response.content,
                  },
                },
              };
            default:
              return prev;
          }
        });
        toast.success("Content generated successfully!");
      } else {
        toast.error("Failed to generate content. Please try again.");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGeneratingAI({
        ...isGeneratingAI,
        [`${section}-${id}-${field}`]: false,
      });
    }
  };

  const addItem = (section: string) => {
    const newItem = { id: Date.now() };
    switch (section) {
      case "experience":
        setExperiences([...experiences, newItem]);
        break;
      case "projects":
        setProjects([...projects, newItem]);
        break;
      case "education":
        setEducation([...education, newItem]);
        break;
      case "certifications":
        setCertifications([...certifications, newItem]);
        break;
      case "achievements":
        setAchievements([...achievements, newItem]);
        break;
    }
  };

  const removeItem = (section: string, id: number) => {
    switch (section) {
      case "experience":
        setExperiences(experiences.filter((item) => item.id !== id));
        break;
      case "projects":
        setProjects(projects.filter((item) => item.id !== id));
        break;
      case "education":
        setEducation(education.filter((item) => item.id !== id));
        break;
      case "certifications":
        setCertifications(certifications.filter((item) => item.id !== id));
        break;
      case "achievements":
        setAchievements(achievements.filter((item) => item.id !== id));
        break;
    }
  };

  const handleInputChange = (
    section: keyof FormState,
    id: number,
    field: string,
    value: string | string[],
  ) => {
    setFormData((prev: FormState) => {
      if (section === "skills") {
        const newState: FormState = Object.assign({}, prev, {
          skills: Object.assign({}, prev.skills, { [field]: value }),
        });
        return newState;
      }

      const updatedSection = Object.assign(
        {},
        prev[section] as Record<number, Record<string, any>>,
      );
      if (!updatedSection[id]) {
        updatedSection[id] = {};
      }
      updatedSection[id] = Object.assign({}, updatedSection[id], {
        [field]: value,
      });

      // Check if section is complete
      const sectionData = updatedSection[id];
      let isComplete = false;

      if (section === "achievements") {
        isComplete =
          Object.values(updatedSection).length > 0 &&
          Object.values(updatedSection).every(
            (ach) =>
              ach?.title?.trim() !== "" &&
              ach?.date?.trim() !== "" &&
              ach?.description?.trim() !== "",
          );
      } else {
        isComplete = Object.values(sectionData).every((val) =>
          Array.isArray(val)
            ? val.length > 0
            : typeof val === "string" && val.trim() !== "",
        );
      }

      // Update completion status
      setCompletedSections((prevState) => ({
        ...prevState,
        [section]: isComplete,
      }));

      // Update form data
      return {
        ...prev,
        [section]: updatedSection,
      } as FormState;
    });
  };

  const renderSectionHeader = (title: string, description: string) => (
    <div className="space-y-2">
      {loading ? (
        <>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </>
      )}
    </div>
  );

  const renderAddButton = (section: string, label: string) => (
    <Button
      variant="outline"
      className="group w-full hover:border-primary"
      onClick={() => addItem(section)}
    >
      <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
      {label}
    </Button>
  );

  const renderTabTrigger = (tab: TabItem) => (
    <TabsTrigger
      key={tab.id}
      value={tab.id}
      className={cn(
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        "group flex items-center gap-2 py-2 transition-all",
        "hover:bg-primary/10",
      )}
    >
      <tab.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
      <span>{tab.label}</span>
      {tab.required && <span className="text-[10px] text-red-500">*</span>}
      {completedSections[tab.id] && (
        <CheckCircle className="h-3 w-3 text-green-500" />
      )}
    </TabsTrigger>
  );

  // Save handlers for each section
  const handleSavePersonal = async () => {
    console.log("Saving personal data:", {
      fullName: formData.name,
      jobTitle: formData.jobTitle,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      linkedIn: formData.linkedIn,
      portfolio: formData.portfolio,
    });

    await saveSection("personal", {
      fullName: formData.name,
      jobTitle: formData.jobTitle,
      email: formData.email,
      phone: formData.phone, // This matches the schema now
      location: formData.location,
      linkedIn: formData.linkedIn,
      portfolio: formData.portfolio,
    });
  };

  const handleSaveExperience = async () => {
    const experienceData = Object.values(formData.experiences).map((exp) => ({
      companyName: exp.companyName,
      jobTitle: exp.jobTitle,
      startDate: exp.startDate,
      endDate: exp.endDate,
      description: exp.description,
      technologies: exp.technologies || [],
    }));
    await saveSection("experience", experienceData);
  };

  const handleSaveProjects = async () => {
    const projectsData = Object.values(formData.projects).map((proj) => ({
      name: proj.name,
      description: proj.description,
      url: proj.url,
      technologies: proj.technologies || [],
      startDate: proj.startDate,
      endDate: proj.endDate,
    }));
    await saveSection("projects", projectsData);
  };

  const handleSaveEducation = async () => {
    const educationData = Object.values(formData.education).map((edu) => ({
      school: edu.school,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy,
      startDate: edu.startDate,
      endDate: edu.endDate,
      gpa: edu.gpa,
      achievements: edu.achievements,
    }));
    await saveSection("education", educationData);
  };

  const handleSaveCertifications = async () => {
    const certificationsData = Object.values(formData.certifications).map(
      (cert) => ({
        name: cert.name,
        issuingOrg: cert.issuingOrg,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        credentialId: cert.credentialId,
        credentialUrl: cert.credentialUrl,
      }),
    );
    await saveSection("certifications", certificationsData);
  };

  const handleSaveAchievements = async () => {
    const achievementsData = Object.values(formData.achievements).map(
      (ach) => ({
        title: ach.title,
        date: ach.date,
        description: ach.description,
      }),
    );
    await saveSection("achievements", achievementsData);
  };

  const handleSaveSkills = async () => {
    await saveSection("skills", formData.skills);
  };

  const handleSaveSummary = async () => {
    await saveSection("summary", { content: formData.summary });
  };

  // Check if current section is valid
  const isCurrentSectionValid = () => {
    console.log("Checking if current section is valid:", activeTab);
    switch (activeTab) {
      case "personal":
        // Map form field names to validation field names
        const personalData = {
          fullName: formData.name,  
          jobTitle: formData.jobTitle,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          linkedIn: formData.linkedIn,
          portfolio: formData.portfolio,
        };
        console.log("Personal data being validated:", personalData);
        return isSectionComplete("personal", personalData);
      case "experience":
        console.log("Validating experience data:", formData.experiences);
        return (
          Object.values(formData.experiences).length > 0 &&
          Object.values(formData.experiences).every(
            (exp) =>
              exp?.companyName?.trim() !== "" &&
              exp?.jobTitle?.trim() !== "" &&
              exp?.startDate?.trim() !== "" &&
              exp?.endDate?.trim() !== "" &&
              exp?.description?.trim() !== "",
          )
        );
      case "projects":
        console.log("Validating projects data:", formData.projects);
        const projectsValid =
          Object.values(formData.projects).length > 0 &&
          Object.values(formData.projects).every(
            (proj) =>
              proj?.name?.trim() !== "" &&
              proj?.startDate?.trim() !== "" &&
              proj?.endDate?.trim() !== "" &&
              proj?.description?.trim() !== "",
          );
        console.log("Projects validation result:", projectsValid);
        return projectsValid;
      case "education":
        console.log("Validating education data:", formData.education);
        return (
          Object.values(formData.education).length > 0 &&
          Object.values(formData.education).every(
            (edu) =>
              edu?.school?.trim() !== "" &&
              edu?.degree?.trim() !== "" &&
              edu?.fieldOfStudy?.trim() !== "" &&
              edu?.startDate?.trim() !== "" &&
              edu?.endDate?.trim() !== "",
          )
        );
      case "certifications":
        console.log("Validating certifications data:", formData.certifications);
        const certificationsValid =
          Object.values(formData.certifications).length > 0 &&
          Object.values(formData.certifications).every(
            (cert) =>
              cert?.name?.trim() !== "" &&
              cert?.issuingOrg?.trim() !== "" &&
              cert?.issueDate?.trim() !== "",
          );
        console.log("Certifications validation result:", certificationsValid);
        return certificationsValid;
      case "achievements":
        console.log("Validating achievements data:", formData.achievements);
        const achievementsValid =
          Object.values(formData.achievements).length > 0 &&
          Object.values(formData.achievements).every(
            (ach) =>
              ach?.title?.trim() !== "" &&
              ach?.date?.trim() !== "" &&
              ach?.description?.trim() !== "",
          );
        console.log("Achievements validation result:", achievementsValid);
        return achievementsValid;
      case "skills":
        console.log("Validating skills data:", formData.skills);
        const skillsValid = formData.skills.technical.length > 0;
        console.log(
          "Skills validation result:",
          skillsValid,
          "Technical skills:",
          formData.skills.technical,
        );
        return skillsValid;
      case "summary":
        return formData.summary?.trim() !== "";
      case "finish":
        return true;
      default:
        return false;
    }
  };

  const handleGenerateResume = async () => {
    try {
      setIsGenerating(true);

      // Prepare resume data
      const resumeData = {
        personalInfo: {
          name: formData.name || "",
          email: formData.email || "",
          phone: formData.phone || "",
          linkedin: formData.linkedIn || "",
          github: formData.github || "",
          location: formData.location || "",
          website: formData.portfolio || "",
          title: formData.jobTitle || "",
        },
        summary: formData.summary || "",
        experience: Object.values(formData.experiences || {})
          .filter((exp) => exp && exp.companyName) // Only include non-empty experiences
          .map((exp) => ({
            company: exp.companyName || "",
            position: exp.jobTitle || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "Present",
            description: exp.description
              ? exp.description
                  .split("\n")
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0)
              : [],
          })),
        education: Object.values(formData.education || {})
          .filter((edu) => edu && edu.school) // Only include non-empty education entries
          .map((edu) => ({
            school: edu.school || "",
            degree: edu.degree || "",
            location: edu.location || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "Present",
            description: edu.achievements
              ? [edu.achievements]
                  .flat()
                  .map((ach) => ach.toString().trim())
                  .filter(Boolean)
              : [],
          })),
        projects: Object.values(formData.projects || {})
          .filter((proj) => proj && proj.name) // Only include non-empty projects
          .map((proj) => ({
            name: proj.name || "",
            technologies: Array.isArray(proj.technologies)
              ? proj.technologies.join(", ")
              : proj.technologies || "",
            date: proj.startDate || "",
            description: proj.description
              ? proj.description
                  .split("\n")
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0)
              : [],
          })),
        skills: {
          technical: Array.isArray(formData.skills?.technical)
            ? formData.skills.technical.filter(Boolean)
            : [],
          soft: Array.isArray(formData.skills?.soft)
            ? formData.skills.soft.filter(Boolean)
            : [],
          languages: Array.isArray(formData.skills?.languages)
            ? formData.skills.languages.filter(Boolean)
            : [],
        },
        certifications: Object.values(formData.certifications || {})
          .filter((cert) => cert && cert.name) // Only include non-empty certifications
          .map((cert) => ({
            name: cert.name || "",
            issuer: cert.issuingOrg || "",
            date: cert.issueDate || "",
            description: cert.credentialId || "",
          })),
        achievements: Object.values(formData.achievements || {})
          .filter((ach) => ach && ach.title) // Only include non-empty achievements
          .map((ach) => ({
            title: ach.title || "",
            date: ach.date || "",
            description: ach.description || "",
          })),
      };

      // Validate required sections
      const requiredSections = [
        "personalInfo",
        "experience",
        "education",
        "skills",
      ];
      const missingFields = requiredSections.filter((section) => {
        if (section === "personalInfo") {
          return (
            !resumeData.personalInfo.name ||
            !resumeData.personalInfo.email ||
            !resumeData.personalInfo.phone
          );
        }
        if (section === "experience") {
          return resumeData.experience.length === 0;
        }
        if (section === "education") {
          return resumeData.education.length === 0;
        }
        if (section === "skills") {
          return resumeData.skills.technical.length === 0;
        }
        return false;
      });

      if (missingFields.length > 0) {
        throw new Error(
          `Please complete the following required sections: ${missingFields.join(", ")}`,
        );
      }

      // Make the API call
      const response = await fetch("/api/resumes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: resumeData,
          template: "modern", // Default to modern template
          resumeId: params.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate resume");
      }

      const result = await response.json();

      // Handle the response
      if (result.success) {
        toast.success("Resume generated successfully!");
        // Navigate to the view page
        router.push(`/document-preparation/resume-builder/${params.id}/view`);
      } else {
        throw new Error("Failed to generate resume");
      }
    } catch (error) {
      console.error("Error generating resume:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate resume",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (isInitialLoading) {
    return <InitialLoadingState />;
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Resume Editor</h2>
        <p className="text-muted-foreground">
          Fill in your details to create a professional resume
        </p>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b p-2 sm:p-4">
            {/* Mobile Navigation */}
            <MobileTabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              completedSections={completedSections}
            />
            
            {/* Desktop Navigation */}
            <TabsList className="hidden md:grid h-full w-full grid-cols-4 lg:grid-cols-6 gap-2">
              {tabs.map(renderTabTrigger)}
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeIn}
                transition={{ duration: 0.3 }}
              >
                {/* Personal Tab */}
                <TabsContent value="personal" className="space-y-4 sm:space-y-6">
                  {renderSectionHeader(
                    "Personal Information",
                    "Add your personal details and contact information",
                  )}
                  <Card className="p-3 sm:p-4">
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <div className="flex gap-2">
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                name: newValue,
                              }));
                            }}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Professional Title</Label>
                        <Input
                          placeholder="Senior Software Engineer"
                          value={formData.jobTitle}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              jobTitle: newValue,
                            }));
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              email: newValue,
                            }));
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 555-5555"
                          pattern="^\+?[1-9][0-9]{7,14}$"
                          title="Please enter a valid phone number (7-15 digits, can start with +)"
                          value={formData.phone}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              phone: newValue,
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          placeholder="City, Country"
                          value={formData.location}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              location: newValue,
                            }));
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="linkedin.com/in/johndoe"
                            value={formData.linkedIn}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                linkedIn: newValue,
                              }));
                            }}
                          />
                          <Button variant="outline" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Portfolio Website</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="johndoe.com"
                            value={formData.portfolio}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                portfolio: newValue,
                              }));
                            }}
                          />
                          <Button variant="outline" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <SectionNavigation
                    currentTab="personal"
                    onTabChange={setActiveTab}
                    isValid={isCurrentSectionValid()}
                    isSaving={isSaving}
                    onSave={handleSavePersonal}
                    validationErrors={validationErrors}
                  />
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience" className="space-y-4 sm:space-y-6">
                  {renderSectionHeader(
                    "Work Experience",
                    "Add your professional work experience",
                  )}
                  {experiences.map((exp) => (
                    <Card key={exp.id} className="space-y-4 p-3 sm:p-4">
                      <div className="flex items-start justify-between">
                        <div className="grid w-full gap-4 sm:gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input
                              placeholder="Company Name"
                              value={
                                formData.experiences[exp.id]?.companyName ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "experiences",
                                  exp.id,
                                  "companyName",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Job Title</Label>
                            <Input
                              placeholder="Senior Software Engineer"
                              value={
                                formData.experiences[exp.id]?.jobTitle ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "experiences",
                                  exp.id,
                                  "jobTitle",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={
                                formData.experiences[exp.id]?.startDate ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "experiences",
                                  exp.id,
                                  "startDate",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={
                                formData.experiences[exp.id]?.endDate ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "experiences",
                                  exp.id,
                                  "endDate",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Technologies Used</Label>
                            <SkillsInput
                              value={
                                formData.experiences[exp.id]?.technologies ?? []
                              }
                              onChange={(techs) =>
                                handleInputChange(
                                  "experiences",
                                  exp.id,
                                  "technologies",
                                  techs,
                                )
                              }
                              placeholder="Add technologies used in this role"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <div className="flex flex-col gap-2">
                              <Textarea
                                placeholder="Describe your role and achievements..."
                                value={
                                  formData.experiences[exp.id]?.description ?? ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "experiences",
                                    exp.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                              />
                              <AIGenerateButton
                                onClick={() =>
                                  handleGenerateAI(
                                    "experience_description",
                                    exp.id,
                                    "description",
                                  )
                                }
                                isLoading={
                                  isGeneratingAI[
                                    `experience_description-${exp.id}-description`
                                  ]
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 shrink-0"
                          onClick={() => removeItem("experience", exp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {renderAddButton("experience", "Add Experience")}
                  <SectionNavigation
                    currentTab="experience"
                    onTabChange={setActiveTab}
                    isValid={isCurrentSectionValid()} 
                    isSaving={isSaving}
                    onSave={handleSaveExperience}
                    validationErrors={validationErrors}
                  />
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-4 sm:space-y-6">
                  {renderSectionHeader(
                    "Projects",
                    "Add your notable projects",
                  )}
                  {projects.map((proj) => (
                    <Card key={proj.id} className="space-y-4 p-3 sm:p-4">
                      <div className="flex items-start justify-between">
                        <div className="grid w-full gap-4 sm:gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Project Name</Label>
                            <Input
                              placeholder="Project Name"
                              value={formData.projects[proj.id]?.name ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "projects",
                                  proj.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Project URL</Label>
                            <Input
                              type="url"
                              placeholder="https://..."
                              value={formData.projects[proj.id]?.url ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "projects",
                                  proj.id,
                                  "url",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={
                                formData.projects[proj.id]?.startDate ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "projects",
                                  proj.id,
                                  "startDate",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={
                                formData.projects[proj.id]?.endDate ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "projects",
                                  proj.id,
                                  "endDate",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Technologies Used</Label>
                            <SkillsInput
                              value={
                                formData.projects[proj.id]?.technologies ?? []
                              }
                              onChange={(techs) =>
                                handleInputChange(
                                  "projects",
                                  proj.id,
                                  "technologies",
                                  techs,
                                )
                              }
                              placeholder="Add technologies used in this project"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <div className="flex flex-col gap-2">
                              <Textarea
                                placeholder="Describe the project and your role..."
                                value={
                                  formData.projects[proj.id]?.description ?? ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "projects",
                                    proj.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                              />
                              <AIGenerateButton
                                onClick={() =>
                                  handleGenerateAI(
                                    "project_description",
                                    proj.id,
                                    "description",
                                  )
                                }
                                isLoading={
                                  isGeneratingAI[
                                    `project_description-${proj.id}-description`
                                  ]
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 shrink-0"
                          onClick={() => removeItem("projects", proj.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {renderAddButton("projects", "Add Project")}
                  <SectionNavigation
                    currentTab="projects"
                    onTabChange={setActiveTab}
                    isValid={isCurrentSectionValid()}
                    isSaving={isSaving}
                    onSave={handleSaveProjects}
                    validationErrors={validationErrors}
                  />
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-4 sm:space-y-6">
                  {renderSectionHeader(
                    "Education",
                    "Add your educational background",
                  )}
                  {education.map((edu) => (
                    <Card key={edu.id} className="space-y-4 p-3 sm:p-4">
                      <div className="flex items-start justify-between">
                        <div className="grid w-full gap-4 sm:gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>School/University</Label>
                            <Input
                              placeholder="Institution Name"
                              value={formData.education[edu.id]?.school ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "education",
                                  edu.id,
                                  "school",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Degree</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={formData.education[edu.id]?.degree ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "education",
                                  edu.id,
                                  "degree",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Select Degree</option>
                              {degreeOptions.map((degree) => (
                                <option key={degree} value={degree}>
                                  {degree}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Field of Study</Label>
                            <Input
                              placeholder="Computer Science"
                              value={
                                formData.education[edu.id]?.fieldOfStudy ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "education",
                                  edu.id,
                                  "fieldOfStudy",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>GPA</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="3.8"
                              value={formData.education[edu.id]?.gpa ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "education",
                                  edu.id,
                                  "gpa",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={
                                formData.education[edu.id]?.startDate ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(  
                                  "education",
                                  edu.id,
                                  "startDate",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={formData.education[edu.id]?.endDate ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "education",
                                  edu.id,
                                  "endDate",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Achievements</Label>
                            <div className="flex flex-col gap-2">
                              <Textarea
                                placeholder="List your academic achievements..."
                                value={
                                  formData.education[edu.id]?.achievements ?? ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "education",
                                    edu.id,
                                    "achievements",
                                    e.target.value,
                                  )
                                }
                              />
                              <AIGenerateButton
                                onClick={() =>
                                  handleGenerateAI(
                                    "achievement_description",
                                    edu.id,
                                    "achievements",
                                  )
                                }
                                isLoading={
                                  isGeneratingAI[
                                    `achievement_description-${edu.id}-achievements`
                                  ]
                                }
                                label="Improve Achievement Text"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 shrink-0"
                          onClick={() => removeItem("education", edu.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {renderAddButton("education", "Add Education")}
                  <SectionNavigation
                    currentTab="education"
                    onTabChange={setActiveTab}
                    isValid={isCurrentSectionValid()}
                    isSaving={isSaving}
                    onSave={handleSaveEducation}
                    validationErrors={validationErrors}
                  />
                </TabsContent>

                {/* Certifications Tab */}
                <TabsContent value="certifications" className="space-y-4 sm:space-y-6">
                  {renderSectionHeader(
                    "Certifications",
                    "Add your certifications and licenses",
                  )}
                  {certifications.map((cert) => (
                    <Card key={cert.id} className="space-y-4 p-3 sm:p-4">
                      <div className="flex items-start justify-between">
                        <div className="grid w-full gap-4 sm:gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Certification Name</Label>
                            <Input
                              placeholder="Certification Name"
                              value={
                                formData.certifications[cert.id]?.name ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "certifications",
                                  cert.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Issuing Organization</Label>
                            <Input
                              placeholder="Organization Name"
                              value={
                                formData.certifications[cert.id]?.issuingOrg ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "certifications",
                                  cert.id,
                                  "issuingOrg",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Issue Date</Label>
                            <Input
                              type="date"
                              value={
                                formData.certifications[cert.id]?.issueDate ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "certifications",
                                  cert.id,
                                  "issueDate",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input
                              type="date"
                              value={
                                formData.certifications[cert.id]?.expiryDate ??
                                ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "certifications",
                                  cert.id,
                                  "expiryDate",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Credential ID</Label>
                            <Input
                              placeholder="ABC123"
                              value={
                                formData.certifications[cert.id]?.credentialId ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "certifications",
                                  cert.id,
                                  "credentialId",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Credential URL</Label>
                            <Input
                              type="url"
                              placeholder="https://..."
                              value={
                                formData.certifications[cert.id]
                                  ?.credentialUrl || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "certifications",
                                  cert.id,
                                  "credentialUrl",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 shrink-0"
                          onClick={() => removeItem("certifications", cert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {renderAddButton("certifications", "Add Certification")}
                  <SectionNavigation
                    currentTab="certifications"
                    onTabChange={setActiveTab}
                    isValid={isCurrentSectionValid()}
                    isSaving={isSaving}
                    onSave={handleSaveCertifications}
                    validationErrors={validationErrors}
                  />
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements" className="space-y-4 sm:space-y-6">
                  {renderSectionHeader(
                    "Achievements",
                    "Add your notable achievements",
                  )}
                  {achievements.map((ach) => (
                    <Card key={ach.id} className="space-y-4 p-3 sm:p-4">
                      <div className="flex items-start justify-between">
                        <div className="grid w-full gap-4 sm:gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Achievement Title</Label>
                            <Input
                              placeholder="Achievement Title"
                              value={
                                formData.achievements[ach.id]?.title ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "achievements",
                                  ach.id,
                                  "title",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={
                                formData.achievements[ach.id]?.date ?? ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "achievements",
                                  ach.id,
                                  "date",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <div className="flex flex-col gap-2">
                              <Textarea
                                placeholder="Describe your achievement..."
                                value={
                                  formData.achievements[ach.id]
                                    ?.description ?? ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "achievements",
                                    ach.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                              />
                              <AIGenerateButton
                                onClick={() =>
                                  handleGenerateAI(
                                    "achievement_description",
                                    ach.id,
                                    "description",
                                  )
                                }
                                isLoading={
                                  isGeneratingAI[
                                    `achievement_description-${ach.id}-description`
                                  ]
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 shrink-0"
                          onClick={() =>
                            removeItem("achievements", ach.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {renderAddButton("achievements", "Add Achievement")}
                  <SectionNavigation
                    currentTab="achievements"
                    onTabChange={setActiveTab}
                    isValid={isCurrentSectionValid()}
                    isSaving={isSaving}
                    onSave={handleSaveAchievements}
                    validationErrors={validationErrors}
                  />
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value="skills" className="space-y-4 sm:space-y-6">
                  {renderSectionHeader(
                    "Skills",
                    "Add your technical and soft skills",
                  )}
                  <Card className="p-3 sm:p-4">
                    <div className="grid gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label>Technical Skills</Label>
                        <SkillsInput
                          value={formData.skills.technical}
                          onChange={(skills) =>
                            handleInputChange("skills", 0, "technical", skills)
                          }
                          placeholder="Add programming languages, frameworks, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Soft Skills</Label>
                        <SkillsInput
                          value={formData.skills.soft}
                          onChange={(skills) =>
                            handleInputChange("skills", 0, "soft", skills)
                          }
                          placeholder="Add communication, leadership, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tools & Technologies</Label>
                        <SkillsInput
                          value={formData.skills.languages}
                          onChange={(skills) =>
                            handleInputChange("skills", 0, "languages", skills)
                          }
                          placeholder="Add languages you're proficient with"
                        />
                      </div>
                    </div>
                  </Card>
                  <SectionNavigation
                    currentTab="skills"
                    onTabChange={setActiveTab}
                    isValid={isCurrentSectionValid()}
                    isSaving={isSaving}
                    onSave={handleSaveSkills}
                    validationErrors={validationErrors}
                  />
                </TabsContent>

                {/* Summary Tab */}
                <TabsContent value="summary" className="space-y-4 sm:space-y-6">
                  {renderSectionHeader(
                    "Professional Summary",
                    "Add a brief professional summary",
                  )}
                  <Card className="p-3 sm:p-4">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Write a professional summary..."
                        value={formData.summary || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, summary: e.target.value })
                        }
                      />
                      <AIGenerateButton
                        onClick={() =>
                          handleGenerateAI("summary", 0, "content")
                        }
                        isLoading={isGeneratingAI[`summary-0-content`]}
                        label="Generate Professional Summary"
                      />
                    </div>
                  </Card>
                  <SectionNavigation
                    currentTab="summary"
                    onTabChange={setActiveTab}
                    isValid={isCurrentSectionValid()}
                    isSaving={isSaving}
                    onSave={handleSaveSummary}
                    validationErrors={validationErrors}
                  />
                </TabsContent>

                {/* Finish Tab */}
                <TabsContent value="finish" className="space-y-4 sm:space-y-6">
                  {renderSectionHeader(
                    "Finish Up",
                    "Review and generate your resume",
                  )}
                  <Card className="p-3 sm:p-4">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Resume Title</Label>
                        <Input
                          placeholder="My Professional Resume"
                          value={resumeTitle}
                          onChange={(e) => setResumeTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Template Style</Label>
                        <TemplateSelector
                          selectedTemplate={selectedTemplate}
                          onTemplateChange={setSelectedTemplate}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </Card>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                      This will use 50 credits
                    </div>
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Handle preview logic
                        }}
                      >
                        Preview
                      </Button>
                      <Button
                        onClick={handleGenerateResume}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            Generate Resume
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <SectionNavigation
                    currentTab="finish"
                    onTabChange={setActiveTab}
                    isValid={isCurrentSectionValid()}
                    isSaving={isSaving}
                    validationErrors={validationErrors}
                  />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
