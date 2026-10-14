"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  Lightbulb,
  GraduationCap,
  Sparkles,
  MessagesSquare,
  Users,
} from "lucide-react";

const features = [
  {
    title: "Interview Questions",
    description:
      "Comprehensive database of interview questions with AI-powered answers",
    icon: MessagesSquare,
    href: "/resources/interview-questions",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverColor: "group-hover:bg-blue-500/20",
    cost: "30 credits",
    features: [
      "Role-specific questions",
      "Industry standards",
      "Expert answers",
      "Practice exercises",
    ],
  },
  {
    title: "Company Guides",
    description: "In-depth guides for top companies' interview processes",
    icon: Building2,
    href: "/resources/company-guides",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    hoverColor: "group-hover:bg-purple-500/20",
    cost: "40 credits",
    features: [
      "Interview process",
      "Company culture",
      "Success stories",
      "Insider tips",
    ],
  },
  {
    title: "Industry Insights",
    description: "Latest trends and insights for different industries",
    icon: Lightbulb,
    href: "/resources/industry-insights",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    hoverColor: "group-hover:bg-green-500/20",
    cost: "25 credits",
    features: [
      "Market trends",
      "Salary insights",
      "Growth areas",
      "Industry reports",
    ],
  },
  {
    title: "Career Tips",
    description: "Expert advice and guidance for career growth",
    icon: GraduationCap,
    href: "/resources/career-tips",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    hoverColor: "group-hover:bg-orange-500/20",
    cost: "20 credits",
    features: [
      "Career planning",
      "Skill development",
      "Networking tips",
      "Growth strategies",
    ],
  },
  {
    title: "Interview Guides",
    description: "Comprehensive guides for different interview types",
    icon: BookOpen,
    href: "/resources/interview-guides",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    hoverColor: "group-hover:bg-indigo-500/20",
    cost: "35 credits",
    features: [
      "Preparation tips",
      "Common pitfalls",
      "Success strategies",
      "Real examples",
    ],
  },
  {
    title: "Peer Network",
    description: "Connect with peers and practice interviews together",
    icon: Users,
    href: "/resources/peer-network",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    hoverColor: "group-hover:bg-pink-500/20",
    cost: "Free",
    features: [
      "Mock interviews",
      "Study groups",
      "Experience sharing",
      "Peer feedback",
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Resources</h2>
        <p className="text-muted-foreground">
          Access curated learning materials and comprehensive interview guides
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <p className="mb-4 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {feature.features.map((item) => (
                      <div
                        key={item}
                        className="flex items-center text-xs text-muted-foreground"
                      >
                        <Sparkles
                          className={cn("mr-1 h-3 w-3", feature.color)}
                        />
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center pt-2 text-sm text-primary">
                    <span className="group-hover:underline">Access Now</span>
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
