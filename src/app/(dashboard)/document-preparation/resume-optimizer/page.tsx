"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  FileText,
  Upload,
  Sparkles,
  BarChart3,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  BookOpen,
  Languages,
  Layout,
  Target,
  Lightbulb,
  ScrollText,
  Pencil,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import type { ResumeAnalysisResult, StoredResumeAnalysis } from "@/types/resume";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const loadingStates = [
  { text: "Uploading your resume...", duration: 3000 },
  { text: "Extracting resume content...", duration: 4000 },
  { text: "Analyzing format and structure...", duration: 4000 },
  { text: "Evaluating content quality...", duration: 4000 },
  { text: "Checking language and communication...", duration: 3000 },
  { text: "Assessing core competencies...", duration: 3000 },
  { text: "Analyzing keyword optimization...", duration: 3000 },
  { text: "Generating improvement suggestions...", duration: 4000 },
  { text: "Preparing final results...", duration: 2000 },
];

const sections = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "format", label: "Format & Structure", icon: Layout },
  { id: "content", label: "Content Quality", icon: ScrollText },
  { id: "language", label: "Language", icon: Languages },
  { id: "competencies", label: "Core Competencies", icon: Target },
  { id: "improvements", label: "Improvements", icon: Lightbulb },
];

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [analyses, setAnalyses] = useState<StoredResumeAnalysis[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const breadcrumbItems = [
    {
      href: "/document-preparation",
      label: "Document Preparation",
      icon: FileSpreadsheet,
    },
    {
      href: "/document-preparation/resume-optimizer",
      label: "Resume Optimizer",
      icon: FileText,
    },
  ];

  useEffect(() => {
    void fetchResumeHistory();
  }, []);

  const fetchResumeHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch("/api/resume-analysis");
      const data = await response.json();

      if (data.success) {
        setAnalyses(data.analyses);
      } else {
        console.error("Failed to fetch analyses:", data.error);
        setAnalyses([]);
      }
    } catch (error) {
      console.error("Error fetching resume history:", error);
      setAnalyses([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      await handleAnalyze(droppedFile);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      await handleAnalyze(selectedFile);
      e.target.value = "";
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleAnalyze = async (fileToAnalyze: File) => {
    try {
      setIsAnalyzing(true);

      const formData = new FormData();
      formData.append("resume", fileToAnalyze);

      const response = await fetch("/api/resume-analysis", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to analyze resume");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setResult({
        success: true,
        file_url: data.metadata.file_url,
        ats_analysis: {
          total_score: data.ats_analysis.total_score,
          section_scores: data.ats_analysis.section_scores,
          detailed_breakdown: data.ats_analysis.detailed_breakdown,
          keyword_match_rate: data.ats_analysis.keyword_match_rate,
          missing_keywords: data.ats_analysis.missing_keywords || [],
        },
        improvement_suggestions: {
          high_priority: data.improvement_suggestions.high_priority || [],
          content: (data.improvement_suggestions.content || []).map((item: { 
            current?: string; 
            impact?: string; 
            section?: string; 
            suggested?: string; 
          }) => ({
            current: item.current || '',
            impact: item.impact || '',
            section: item.section || '',
            suggested: item.suggested || '',
          })),
          format: (data.improvement_suggestions.format || []).map((item: {
            improved?: string;
            original?: string;
            reason?: string;
          }) => ({
            improved: item.improved || '',
            original: item.original || '',
            reason: item.reason || '',
          })),
          language: (data.improvement_suggestions.language || []).map((item: {
            improved?: string;
            original?: string;
            reason?: string;
          }) => ({
            improved: item.improved || '',
            original: item.original || '',
            reason: item.reason || '',
          })),
          keywords: data.improvement_suggestions.keywords || [],
        },
        improvement_details: {
          bullet_points: data.improvement_details.bullet_points || [],
          achievements: data.improvement_details.achievements || [],
          skills: data.improvement_details.skills || [],
        },
        metadata: {
          filename: data.metadata.filename,
          job_description_provided: data.metadata.job_description_provided,
          timestamp: data.metadata.timestamp,
          file_url: data.metadata.file_url,
        },
      });

      toast.success("Analysis completed successfully!");
      await fetchResumeHistory(); // Refresh the history after successful analysis
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to analyze resume. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderScoreCard = (title: string, score: number) => {
    // Convert score to percentage for consistent color coding
    const percentage = (score / 20) * 100;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium capitalize">
            {title.replace(/_/g, " ")}
          </p>
          <span
            className={cn(
              "text-sm font-semibold",
              percentage >= 80
                ? "text-emerald-500"
                : percentage >= 60
                  ? "text-amber-500"
                  : "text-rose-500",
            )}
          >
            {score}/20
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
          <div
            className={cn(
              "h-full transition-all duration-500",
              percentage >= 80
                ? "bg-gradient-to-r from-emerald-400/80 via-emerald-500/80 to-emerald-600/80"
                : percentage >= 60
                  ? "bg-gradient-to-r from-amber-400/80 via-amber-500/80 to-amber-600/80"
                  : "bg-gradient-to-r from-rose-400/80 via-rose-500/80 to-rose-600/80",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const renderDetailedBreakdown = (
    title: string,
    data: Record<string, number> | {
      length_depth_score: number;
      bullet_usage_score: number;
      bullet_length_score: number;
      page_density_score: number;
      formatting_score: number;
    } | {
      impact_score: number;
      achievements_score: number;
      relevance_score: number;
      technical_depth_score: number;
    } | {
      verb_strength: number;
      tense_consistency: number;
      clarity: number;
      spelling_grammar: number;
      professional_tone: number;
    } | {
      leadership_initiative: number;
      problem_solving: number;
      collaboration: number;
      results_orientation: number;
    }
  ) => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          {title}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 pt-2">
            {Object.entries(data).map(([key, value]) => {
              const percentage = (value / 20) * 100;
              return (
                <div key={`${title}-${key}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm capitalize">
                      {key.replace(/_/g, " ").replace(/score$/, "")}
                    </p>
                    <p className={cn(
                      "text-sm font-medium",
                      percentage >= 80
                        ? "text-emerald-500"
                        : percentage >= 60
                          ? "text-amber-500"
                          : "text-rose-500",
                    )}>
                      {value}/20
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        percentage >= 80
                          ? "bg-gradient-to-r from-emerald-400/80 via-emerald-500/80 to-emerald-600/80"
                          : percentage >= 60
                            ? "bg-gradient-to-r from-amber-400/80 via-amber-500/80 to-amber-600/80"
                            : "bg-gradient-to-r from-rose-400/80 via-rose-500/80 to-rose-600/80",
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const renderImprovementSection = (title: string, items: any[]) => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={`${title}-item-${index}`} className="space-y-3 p-4">
            {/* Content improvements */}
            {item.current && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Pencil className="h-4 w-4" />
                  <span>Current</span>
                </div>
                <p className="text-sm">{item.current}</p>
              </div>
            )}
            {item.suggested && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span>Suggested</span>
                </div>
                <p className="text-sm">{item.suggested}</p>
              </div>
            )}
            {/* Format improvements */}
            {item.original && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Pencil className="h-4 w-4" />
                  <span>Original</span>
                </div>
                <p className="text-sm">{item.original}</p>
              </div>
            )}
            {item.improved && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span>Improved</span>
                </div>
                <p className="text-sm">{item.improved}</p>
              </div>
            )}
            {/* Common fields */}
            {item.impact && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-blue-500">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Impact</span>
                </div>
                <p className="text-sm">{item.impact}</p>
              </div>
            )}
            {item.reason && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-purple-500">
                  <BookOpen className="h-4 w-4" />
                  <span>Reason</span>
                </div>
                <p className="text-sm">{item.reason}</p>
              </div>
            )}
            {item.section && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Section:</span>
                <span className="font-medium">{item.section}</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => {
    const displayedAnalyses = showAll ? analyses : analyses.slice(0, 3);

    return isLoadingHistory ? (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Previous Analyses</h3>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card 
              key={i} 
              className="relative overflow-hidden p-6 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-3 w-full max-w-[60%]">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-primary/20 animate-pulse" />
                      <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-16 bg-muted animate-pulse rounded-full" />
                    <div className="flex gap-2">
                      <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-8 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-1.5 w-full bg-muted animate-pulse rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    ) : !analyses || analyses.length === 0 ? (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Previous Analyses</h3>
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              No previous analyses found. Upload a resume to get started.
            </p>
          </div>
        </Card>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Previous Analyses</h3>
          <p className="text-sm text-muted-foreground">
            {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'} found
          </p>
        </div>
        <div className="grid gap-4">
          {displayedAnalyses.map((analysis) => (
            <Card
              key={analysis.id}
              className="group relative h-full overflow-hidden transition-all hover:border-primary hover:shadow-lg"
            >
              {/* Premium gradient background */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2 transition-colors duration-300 group-hover:bg-primary/20">
                        <FileText className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                      </div>
                      <p className="font-medium">{analysis.originalFilename}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(analysis.createdAt), "PPP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                        (analysis.totalScore) >= 80
                          ? "bg-emerald-500/10 text-emerald-500"
                          : (analysis.totalScore) >= 60
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-rose-500/10 text-rose-500",
                      )}
                    >
                      {analysis.totalScore}/100
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          const storedSuggestions = analysis.improvementSuggestions as unknown as {
                            high_priority: string[];
                            content: Array<{
                              current?: string;
                              impact?: string;
                              section?: string;
                              suggested?: string;
                            }>;
                            format: Array<{
                              improved?: string;
                              original?: string;
                              reason?: string;
                            }>;
                            language: Array<{
                              improved?: string;
                              original?: string;
                              reason?: string;
                            }>;
                            keywords: string[];
                          };

                          setResult({
                            success: true,
                            file_url: analysis.fileUrl,
                            ats_analysis: {
                              total_score: analysis.totalScore,
                              section_scores: analysis.sectionScores,
                              detailed_breakdown: analysis.detailedBreakdown,
                              keyword_match_rate: analysis.keywordMatchRate,
                              missing_keywords: analysis.missingKeywords,
                            },
                            improvement_suggestions: {
                              high_priority: storedSuggestions.high_priority || [],
                              content: (storedSuggestions.content || []).map(item => ({
                                current: item.current || '',
                                impact: item.impact || '',
                                section: item.section || '',
                                suggested: item.suggested || '',
                              })),
                              format: (storedSuggestions.format || []).map(item => ({
                                improved: item.improved || '',
                                original: item.original || '',
                                reason: item.reason || '',
                              })),
                              language: (storedSuggestions.language || []).map(item => ({
                                improved: item.improved || '',
                                original: item.original || '',
                                reason: item.reason || '',
                              })),
                              keywords: storedSuggestions.keywords || [],
                            },
                            improvement_details: {
                              bullet_points: analysis.improvementDetails.bullet_points || [],
                              achievements: analysis.improvementDetails.achievements || [],
                              skills: analysis.improvementDetails.skills || [],
                            },
                            metadata: {
                              filename: analysis.originalFilename,
                              job_description_provided: false,
                              timestamp: analysis.createdAt,
                              file_url: analysis.fileUrl,
                            },
                          });
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          View
                        </div>
                      </Button>
                      {analysis.fileUrl && (
                        <Button
                          variant="secondary"
                          size="sm"
                          asChild
                        >
                          <a
                            href={analysis.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="flex items-center gap-2">
                              <Download className="h-4 w-4" />
                              Download
                            </div>
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-4">
                  {Object.entries(analysis.sectionScores).map(([key, score]) => {
                    const percentage = (score / 20) * 100;
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs capitalize">
                            {key.replace(/_/g, " ")}
                          </p>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              percentage >= 80
                                ? "text-emerald-500"
                                : percentage >= 60
                                  ? "text-amber-500"
                                  : "text-rose-500",
                            )}
                          >
                            {score}/20
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              percentage >= 80
                                ? "bg-gradient-to-r from-emerald-400/80 via-emerald-500/80 to-emerald-600/80"
                                : percentage >= 60
                                  ? "bg-gradient-to-r from-amber-400/80 via-amber-500/80 to-amber-600/80"
                                  : "bg-gradient-to-r from-rose-400/80 via-rose-500/80 to-rose-600/80",
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
        {analyses.length > 3 && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="lg"
              className="group relative overflow-hidden rounded-lg px-8"
              onClick={() => setShowAll(!showAll)}
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex items-center gap-2">
                {showAll ? (
                  <>
                    <span>Show Less</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </>
                ) : (
                  <>
                    <span>View All {analyses.length} Analyses</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </>
                )}
              </div>
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Resume Optimizer
            </h2>
            <p className="text-muted-foreground">
              Analyzing your resume for better results
            </p>
          </div>

          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <MultiStepLoader
              loadingStates={loadingStates}
              loading={true}
              duration={2000}
              loop={false}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Resume Analysis Results
            </h2>
            <p className="text-muted-foreground">
              Here&apos;s a detailed analysis of your resume with suggestions
              for improvement
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar Navigation */}
            <Card className="col-span-2 p-4">
              <div className="space-y-4">
                {sections.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      activeSection === id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Main Content */}
            <div className="col-span-6 space-y-6">
              {/* Overview Section */}
              {activeSection === "overview" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Total Score */}
                  <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">
                            Overall ATS Score
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Based on industry standard evaluation criteria
                          </p>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-2 rounded-full px-4 py-2 text-lg font-semibold",
                            result.ats_analysis.total_score >= 80
                              ? "bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-500"
                              : result.ats_analysis.total_score >= 60
                                ? "bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-500"
                                : "bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-rose-500",
                          )}
                        >
                          <span>{result.ats_analysis.total_score}</span>
                          <span className="text-sm text-muted-foreground">
                            /100
                          </span>
                        </div>
                      </div>

                      {/* Section Scores */}
                      <div className="grid gap-4">
                        {Object.entries(result.ats_analysis.section_scores).map(
                          ([key, score]) => (
                            <div key={`section-score-${key}`}>
                              {renderScoreCard(key, score)}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* High Priority Improvements */}
                  <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">
                            High Priority Improvements
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Critical areas that need immediate attention
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {result.improvement_suggestions.high_priority.map(
                          (suggestion, index) => (
                            <div
                              key={`high-priority-${index}`}
                              className="flex items-start gap-3 rounded-lg border border-destructive/10 bg-destructive/5 p-3"
                            >
                              <div className="rounded-full bg-destructive/10 p-1.5">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              </div>
                              <p className="text-sm">{suggestion}</p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Format Section */}
              {activeSection === "format" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                    {renderDetailedBreakdown(
                      "Format Analysis",
                      result.ats_analysis.detailed_breakdown.format_analysis,
                    )}
                  </Card>
                  {result.improvement_suggestions.format.length > 0 && (
                    <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                      {renderImprovementSection(
                        "Format Improvements",
                        result.improvement_suggestions.format,
                      )}
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Content Section */}
              {activeSection === "content" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                    {renderDetailedBreakdown(
                      "Content Analysis",
                      result.ats_analysis.detailed_breakdown.content_analysis,
                    )}
                  </Card>
                  {result.improvement_suggestions.content.length > 0 && (
                    <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                      {renderImprovementSection(
                        "Content Improvements",
                        result.improvement_suggestions.content,
                      )}
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Language Section */}
              {activeSection === "language" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                    {renderDetailedBreakdown(
                      "Language Analysis",
                      result.ats_analysis.detailed_breakdown.language_analysis,
                    )}
                  </Card>
                  {result.improvement_suggestions.language.length > 0 && (
                    <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                      {renderImprovementSection(
                        "Language Improvements",
                        result.improvement_suggestions.language,
                      )}
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Competencies Section */}
              {activeSection === "competencies" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                    {renderDetailedBreakdown(
                      "Core Competencies Analysis",
                      result.ats_analysis.detailed_breakdown
                        .competencies_analysis,
                    )}
                  </Card>
                </motion.div>
              )}

              {/* Improvements Section */}
              {activeSection === "improvements" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* High Priority */}
                  <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                      High Priority Improvements
                    </h3>
                    <div className="space-y-3">
                      {result.improvement_suggestions.high_priority.map(
                        (suggestion, index) => (
                          <div
                            key={`improvement-${index}`}
                            className="flex items-start gap-3 rounded-lg border border-destructive/10 bg-destructive/5 p-3"
                          >
                            <div className="rounded-full bg-destructive/10 p-1.5">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            </div>
                            <p className="text-sm">{suggestion}</p>
                          </div>
                        ),
                      )}
                    </div>
                  </Card>

                  {/* Detailed Improvements */}
                  {result.improvement_details.bullet_points.length > 0 && (
                    <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                      {renderImprovementSection(
                        "Bullet Point Improvements",
                        result.improvement_details.bullet_points,
                      )}
                    </Card>
                  )}
                  {result.improvement_details.achievements.length > 0 && (
                    <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                      {renderImprovementSection(
                        "Achievement Improvements",
                        result.improvement_details.achievements,
                      )}
                    </Card>
                  )}
                  {result.improvement_details.skills.length > 0 && (
                    <Card className="border-muted-foreground/20 bg-gradient-to-br from-background via-muted/50 to-background p-6">
                      {renderImprovementSection(
                        "Skills Improvements",
                        result.improvement_details.skills,
                      )}
                    </Card>
                  )}
                </motion.div>
              )}
            </div>

            {/* Resume Preview */}
            <div className="col-span-4">
              <Card className="sticky top-4 h-[calc(100vh-12rem)] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Resume Preview</h3>
                  {result?.metadata?.file_url && (
                    <a
                      href={result.metadata.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      Open PDF
                    </a>
                  )}
                </div>
                <div className="h-full w-full overflow-hidden rounded-lg border bg-white">
                  {result?.metadata?.file_url ? (
                    <object
                      data={result.metadata.file_url}
                      type="application/pdf"
                      className="h-full w-full"
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-muted-foreground">
                        <FileText className="h-12 w-12" />
                        <div>
                          <p className="font-medium">PDF viewer not supported</p>
                          <p className="text-sm">
                            <a
                              href={result.metadata.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Click here to view the PDF
                            </a>
                          </p>
                        </div>
                      </div>
                    </object>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-muted-foreground">
                      <FileText className="h-12 w-12" />
                      <div>
                        <p className="font-medium">No preview available</p>
                        <p className="text-sm">Resume file preview is not available for this analysis</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button onClick={() => setResult(null)}>
              Upload Another Resume
            </Button>
          </div>
        </motion.div>

        {renderHistory()}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Resume Optimizer
          </h2>
          <p className="text-muted-foreground">
            Upload your resume and we&apos;ll help you optimize it for better
            results
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={cn(
                "border-2 border-dashed p-12 transition-colors duration-200",
                isDragging ? "border-primary/50 bg-primary/5" : "border-border",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Upload your resume</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Drag and drop your resume PDF here, or click to browse
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      document.getElementById("resume-upload")?.click()
                    }
                  >
                    Browse Files
                  </Button>
                </div>
                {file && !isAnalyzing && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                )}
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                  Uses 30 credits
                </div>
              </div>
            </Card>
          </motion.div>

          {renderHistory()}
        </div>
      </motion.div>
    </div>
  );
}
