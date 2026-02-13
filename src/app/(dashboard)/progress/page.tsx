"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LineChart, History, Brain, Trophy } from "lucide-react";

const features = [
  {
    title: "Performance Analytics",
    description: "Track your interview performance and improvement metrics",
    icon: LineChart,
    href: "/progress/analytics",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverColor: "group-hover:bg-blue-500/20",
    metrics: [
      {
        label: "Overall Score",
        value: "85%",
        trend: "+5%",
      },
      {
        label: "Interviews",
        value: "12",
        trend: "+3",
      },
      {
        label: "Skills",
        value: "8",
        trend: "+2",
      },
      {
        label: "Rank",
        value: "Top 10%",
        trend: "↑",
      },
    ],
  },
  {
    title: "Interview History",
    description: "Review past interviews and track your progress over time",
    icon: History,
    href: "/progress/history",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    hoverColor: "group-hover:bg-purple-500/20",
    metrics: [
      {
        label: "Total",
        value: "24",
        trend: "",
      },
      {
        label: "This Month",
        value: "6",
        trend: "+2",
      },
      {
        label: "Success Rate",
        value: "75%",
        trend: "+8%",
      },
      {
        label: "Avg Duration",
        value: "45m",
        trend: "-5m",
      },
    ],
  },
  {
    title: "Skill Assessment",
    description: "Detailed analysis of your technical and soft skills",
    icon: Brain,
    href: "/progress/skills",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    hoverColor: "group-hover:bg-green-500/20",
    metrics: [
      {
        label: "Technical",
        value: "92%",
        trend: "+4%",
      },
      {
        label: "Soft Skills",
        value: "88%",
        trend: "+6%",
      },
      {
        label: "Areas",
        value: "12",
        trend: "+3",
      },
      {
        label: "Growth",
        value: "High",
        trend: "↑",
      },
    ],
  },
  {
    title: "Achievements",
    description: "Track your milestones and earned certificates",
    icon: Trophy,
    href: "/progress/achievements",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    hoverColor: "group-hover:bg-orange-500/20",
    metrics: [
      {
        label: "Certificates",
        value: "5",
        trend: "+2",
      },
      {
        label: "Badges",
        value: "12",
        trend: "+3",
      },
      {
        label: "Points",
        value: "850",
        trend: "+120",
      },
      {
        label: "Level",
        value: "Pro",
        trend: "↑",
      },
    ],
  },
];

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Progress & Analytics
        </h2>
        <p className="text-muted-foreground">
          Track your performance and improvement over time
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {feature.metrics.map((metric) => (
                      <div key={metric.label} className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {metric.label}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">
                            {metric.value}
                          </span>
                          {metric.trend && (
                            <span
                              className={cn(
                                "text-xs",
                                metric.trend.includes("-")
                                  ? "text-red-500"
                                  : "text-green-500",
                              )}
                            >
                              {metric.trend}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center pt-2 text-sm text-primary">
                    <span className="group-hover:underline">View Details</span>
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
