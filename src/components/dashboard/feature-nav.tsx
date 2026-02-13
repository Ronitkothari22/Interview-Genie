"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FileText,
  Video,
  BookOpen,
  BarChart,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface FeatureNavProps {
  className?: string;
  type?: "document" | "interview" | "resources" | "progress";
}

const features = [
  {
    title: "Document Preparation",
    description: "Create and optimize your Resume, LinkedIn Profile, and more",
    icon: FileText,
    href: "/document-preparation",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverColor: "group-hover:bg-blue-500/20",
    items: [
      "AI Resume Builder",
      "Resume Optimizer",
      "LinkedIn Optimizer",
      "Cover Letter Generator",
    ],
    type: "document",
  },
  {
    title: "Interview Preparation",
    description:
      "Practice with AI-powered mock interviews and get instant feedback",
    icon: Video,
    href: "/interview-preparation",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    hoverColor: "group-hover:bg-purple-500/20",
    items: [
      "Video Interviews",
      "Audio Interviews",
      "Technical Interviews",
      "Behavioral Interviews",
    ],
    type: "interview",
  },
  {
    title: "Resources",
    description: "Access curated learning materials and interview guides",
    icon: BookOpen,
    href: "/resources",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    hoverColor: "group-hover:bg-green-500/20",
    items: [
      "Interview Questions",
      "Company Guides",
      "Industry Insights",
      "Career Tips",
    ],
    type: "resources",
  },
  {
    title: "Progress & Analytics",
    description: "Track your performance and improvement over time",
    icon: BarChart,
    href: "/progress",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    hoverColor: "group-hover:bg-orange-500/20",
    items: [
      "Performance Analytics",
      "Interview History",
      "Skill Assessment",
      "Certificates",
    ],
    type: "progress",
  },
];

export function FeatureNav({ type }: FeatureNavProps) {
  const filteredFeatures = type
    ? features.filter((feature) => feature.type === type)
    : features;

  return (
    <div className="grid grid-cols-1 gap-4">
      {filteredFeatures.map((feature) => (
        <Link key={feature.title} href={feature.href} className="block">
          <Card className="group h-full transition-all hover:border-primary hover:shadow-lg">
            <div className="relative h-full p-4 md:p-6">
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
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>

                <div>
                  <h3 className="mb-1.5 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {feature.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center text-sm text-muted-foreground group-hover:text-muted-foreground/80"
                    >
                      <Sparkles
                        className={cn("mr-1.5 h-3.5 w-3.5", feature.color)}
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
