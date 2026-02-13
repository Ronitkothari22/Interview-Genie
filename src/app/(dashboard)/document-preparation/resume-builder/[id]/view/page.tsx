"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Eye, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ResumeData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
  };
  experiences: Array<{
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    achievements?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
  }>;
  certifications: Array<{
    name: string;
    issuingOrg: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;
  achievements: Array<{
    title?: string;
    date?: string;
    description?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  summary?: {
    content: string;
  };
}

export default function ResumeViewPage() {
  const params = useParams();
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch(`/api/resumes/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch resume");
        }
        const data = await response.json();
        setResumeData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      void fetchResume();
    }
  }, [params.id]);

  const handleDownload = async () => {
    try {
      const loadingToast = toast.loading(
        "Preparing your resume for download...",
      );
      const response = await fetch(`/api/resumes/${params.id}/download`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const fileName =
        `${resumeData?.personalInfo?.fullName?.replace(/\s+/g, "-")}-Resume.pdf`.toLowerCase() ||
        `resume-${params.id}.pdf`;

      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss(loadingToast);
      toast.success("Resume downloaded successfully!");
    } catch (err) {
      console.error("Download error:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to download resume. Please try again.",
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-[800px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold">Resume Not Found</h2>
          <p className="mt-2">The requested resume could not be found.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/document-preparation/resume-builder">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resumes
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              {resumeData.personalInfo.fullName}&apos;s Resume
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button variant="default" onClick={() => setPreviewOpen(true)}>
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
          </div>
        </div>

        <Card className="!bg-white p-8 dark:!bg-white dark:!text-black">
          <div className="mb-8">
            <h2 className="text-2xl font-bold !text-black dark:!text-black">
              {resumeData.personalInfo.fullName}
            </h2>
            <p className="text-gray-600 dark:text-gray-600">
              {resumeData.personalInfo.jobTitle}
            </p>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              <p>{resumeData.personalInfo.email}</p>
              <p>{resumeData.personalInfo.phone}</p>
              <p>{resumeData.personalInfo.location}</p>
            </div>
          </div>

          {resumeData.summary && (
            <div className="mb-8">
              <h3 className="mb-2 text-lg font-semibold">
                Professional Summary
              </h3>
              <p className="text-gray-700">{resumeData.summary.content}</p>
            </div>
          )}

          {resumeData.experiences?.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">Experience</h3>
              {resumeData.experiences.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{exp.jobTitle}</h4>
                    <span className="text-sm text-gray-500">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{exp.companyName}</p>
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">{exp.description}</p>
                    {exp.technologies?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {exp.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {resumeData.education?.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">Education</h3>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{edu.degree}</h4>
                    <span className="text-sm text-gray-500">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{edu.school}</p>
                  <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                  {edu.gpa && (
                    <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                  )}
                  {edu.achievements && (
                    <p className="mt-2 text-sm text-gray-700">
                      {edu.achievements}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {resumeData.skills && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">Skills</h3>
              {resumeData.skills.technical?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600">
                    Technical Skills
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resumeData.skills.technical.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.skills.soft?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600">
                    Soft Skills
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resumeData.skills.soft.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.skills.tools?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Tools</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resumeData.skills.tools.map((tool, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {resumeData.projects?.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">Projects</h3>
              {resumeData.projects.map((project, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{project.name}</h4>
                    {project.startDate && (
                      <span className="text-sm text-gray-500">
                        {project.startDate} - {project.endDate ?? "Present"}
                      </span>
                    )}
                  </div>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Project Link
                    </a>
                  )}
                  <p className="mt-2 text-sm text-gray-700">
                    {project.description}
                  </p>
                  {project.technologies?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {resumeData.certifications?.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">Certifications</h3>
              {resumeData.certifications.map((cert, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{cert.name}</h4>
                    <span className="text-sm text-gray-500">
                      {cert.issueDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{cert.issuingOrg}</p>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Credential
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {resumeData.achievements?.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">Achievements</h3>
              {resumeData.achievements.map((achievement, index) => (
                <div key={index} className="mb-4">
                  {achievement.title && (
                    <div className="flex justify-between">
                      <h4 className="font-medium">{achievement.title}</h4>
                      {achievement.date && (
                        <span className="text-sm text-gray-500">
                          {achievement.date}
                        </span>
                      )}
                    </div>
                  )}
                  {achievement.description && (
                    <p className="mt-1 text-sm text-gray-700">
                      {achievement.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl overflow-hidden !bg-white p-0 dark:!bg-white">
          <div className="sticky top-0 z-50 flex items-center justify-between border-b !bg-white p-4 dark:!bg-white">
            <h2 className="text-lg font-semibold !text-black dark:!text-black">
              Resume Preview
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-[80vh] overflow-y-auto bg-muted p-4">
            <div
              className={cn(
                "mx-auto w-full max-w-[210mm] !bg-white !text-black",
                "p-8 shadow-lg print:shadow-none",
              )}
            >
              {/* Header */}
              <header className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-[#466995]">
                  {resumeData.personalInfo.fullName}
                </h1>
                <p className="mb-4 text-lg text-[#466995]/80">
                  {resumeData.personalInfo.jobTitle}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <a
                    href={`mailto:${resumeData.personalInfo.email}`}
                    className="text-[#466995] hover:underline"
                  >
                    {resumeData.personalInfo.email}
                  </a>
                  <span>{resumeData.personalInfo.phone}</span>
                  <span>{resumeData.personalInfo.location}</span>
                </div>
              </header>

              {/* Summary */}
              {resumeData.summary && (
                <section className="mb-6">
                  <h2 className="mb-3 border-b-2 border-[#466995] text-xl font-semibold text-[#466995]">
                    Summary
                  </h2>
                  <p className="text-sm leading-relaxed">
                    {resumeData.summary.content}
                  </p>
                </section>
              )}

              {/* Experience */}
              {resumeData.experiences?.length > 0 && (
                <section className="mb-6">
                  <h2 className="mb-3 border-b-2 border-[#466995] text-xl font-semibold text-[#466995]">
                    Experience
                  </h2>
                  {resumeData.experiences.map((exp, index) => (
                    <div key={index} className="mb-4">
                      <div className="mb-1 flex items-baseline justify-between">
                        <h3 className="text-base font-semibold">
                          {exp.companyName}
                        </h3>
                        <span className="text-sm text-gray-600">
                          {exp.startDate} - {exp.endDate}
                        </span>
                      </div>
                      <p className="mb-2 text-sm italic">{exp.jobTitle}</p>
                      <p className="text-sm">{exp.description}</p>
                      {exp.technologies?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {exp.technologies.map((tech, i) => (
                            <span key={i} className="text-sm text-gray-600">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Education */}
              {resumeData.education?.length > 0 && (
                <section className="mb-6">
                  <h2 className="mb-3 border-b-2 border-[#466995] text-xl font-semibold text-[#466995]">
                    Education
                  </h2>
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="mb-4">
                      <div className="mb-1 flex items-baseline justify-between">
                        <h3 className="text-base font-semibold">
                          {edu.school}
                        </h3>
                        <span className="text-sm text-gray-600">
                          {edu.startDate} - {edu.endDate}
                        </span>
                      </div>
                      <p className="mb-2 text-sm italic">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                      {edu.achievements && (
                        <p className="mt-1 text-sm">{edu.achievements}</p>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Projects */}
              {resumeData.projects?.length > 0 && (
                <section className="mb-6">
                  <h2 className="mb-3 border-b-2 border-[#466995] text-xl font-semibold text-[#466995]">
                    Projects
                  </h2>
                  {resumeData.projects.map((project, index) => (
                    <div key={index} className="mb-4">
                      <div className="mb-1 flex items-baseline justify-between">
                        <h3 className="text-base font-semibold">
                          {project.name}
                        </h3>
                        {project.startDate && (
                          <span className="text-sm text-gray-600">
                            {project.startDate} - {project.endDate ?? "Present"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{project.description}</p>
                      {project.technologies?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.technologies.map((tech, i) => (
                            <span key={i} className="text-sm text-gray-600">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-sm text-[#466995] hover:underline"
                        >
                          View Project
                        </a>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Skills */}
              {resumeData.skills && (
                <section className="mb-6">
                  <h2 className="mb-3 border-b-2 border-[#466995] text-xl font-semibold text-[#466995]">
                    Skills
                  </h2>
                  <div className="space-y-2 text-sm">
                    {resumeData.skills.technical?.length > 0 && (
                      <p>
                        <strong>Technical:</strong>{" "}
                        {resumeData.skills.technical.join(", ")}
                      </p>
                    )}
                    {resumeData.skills.soft?.length > 0 && (
                      <p>
                        <strong>Soft Skills:</strong>{" "}
                        {resumeData.skills.soft.join(", ")}
                      </p>
                    )}
                    {resumeData.skills.tools?.length > 0 && (
                      <p>
                        <strong>Tools:</strong>{" "}
                        {resumeData.skills.tools.join(", ")}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {resumeData.certifications?.length > 0 && (
                <section className="mb-6">
                  <h2 className="mb-3 border-b-2 border-[#466995] text-xl font-semibold text-[#466995]">
                    Certifications
                  </h2>
                  {resumeData.certifications.map((cert, index) => (
                    <div key={index} className="mb-3">
                      <div className="mb-1 flex items-baseline justify-between">
                        <h3 className="text-base font-semibold">{cert.name}</h3>
                        <span className="text-sm text-gray-600">
                          {cert.issueDate}
                        </span>
                      </div>
                      <p className="text-sm italic">{cert.issuingOrg}</p>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-sm text-[#466995] hover:underline"
                        >
                          View Credential
                        </a>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Achievements */}
              {resumeData.achievements?.length > 0 && (
                <section className="mb-6">
                  <h2 className="mb-3 border-b-2 border-[#466995] text-xl font-semibold text-[#466995]">
                    Achievements
                  </h2>
                  {resumeData.achievements.map((achievement, index) => (
                    <div key={index} className="mb-3">
                      {achievement.title && (
                        <div className="mb-1 flex items-baseline justify-between">
                          <h3 className="text-base font-semibold">
                            {achievement.title}
                          </h3>
                          {achievement.date && (
                            <span className="text-sm text-gray-600">
                              {achievement.date}
                            </span>
                          )}
                        </div>
                      )}
                      {achievement.description && (
                        <p className="text-sm">{achievement.description}</p>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
