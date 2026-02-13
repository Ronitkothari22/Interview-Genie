"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FileText, Linkedin, FileEdit, Sparkles } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FileSpreadsheet } from "lucide-react";

const features = [
  {
    title: "AI Resume Builder",
    description: "Create a professional resume with AI-powered suggestions",
    icon: FileText,
    href: "/document-preparation/resume-builder",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverColor: "group-hover:bg-blue-500/20",
    cost: "50 credits",
  },
  {
    title: "Resume Optimizer",
    description: "Get AI feedback to improve your resume's ATS score",
    icon: FileEdit,
    href: "/document-preparation/resume-optimizer",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    hoverColor: "group-hover:bg-purple-500/20",
    cost: "30 credits",
  },
  {
    title: "LinkedIn Optimizer",
    description: "Create an impressive LinkedIn profile that stands out",
    icon: Linkedin,
    href: "/document-preparation/linkedin-optimizer",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    hoverColor: "group-hover:bg-green-500/20",
    cost: "40 credits",
  },
  {
    title: "Cover Letter Builder",
    description:
      "Create a compelling cover letter tailored to your job application",
    icon: FileEdit,
    href: "/document-preparation/cover-letter-builder",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    hoverColor: "group-hover:bg-orange-500/20",
    cost: "20 credits",
  },
];

export default function DocumentPreparationPage() {
  const breadcrumbItems = [
    {
      href: "/document-preparation",
      label: "Document Preparation",
      icon: FileSpreadsheet,
    },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Document Preparation
        </h2>
        <p className="text-muted-foreground">
          Create and optimize your professional documents with AI assistance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href} className="block">
            <Card className="group h-full transition-all hover:border-primary hover:shadow-lg">
              <div className="relative h-full p-6">
                {/* Animated gradient background */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "w-fit rounded-lg p-2.5 transition-colors duration-300",
                        feature.bgColor,
                        feature.hoverColor,
                      )}
                    >
                      <feature.icon
                        className={cn(
                          "h-6 w-6 transition-transform group-hover:scale-110",
                          feature.color,
                        )}
                      />
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Sparkles className="mr-1 h-4 w-4" />
                      {feature.cost}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
