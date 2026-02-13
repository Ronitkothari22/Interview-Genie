"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FileText,
  Video,
  Brain,
  Target,
  Sparkles,
  LineChart,
  GraduationCap,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  credits: number;
  subscriptionStatus: string;
  isVerified: boolean;
}

interface QuickActionsProps {
  user: User;
}

const quickActions = [
  {
    title: "Resume Builder",
    description: "Create professional resume with AI",
    icon: FileText,
    href: "/document-preparation/resume-builder",
    color: "text-blue-500",
    cost: "50 credits",
  },
  {
    title: "Video Interview",
    description: "Practice with real-time AI feedback",
    icon: Video,
    href: "/interview-preparation/video",
    color: "text-purple-500",
    cost: "100 credits",
  },
  {
    title: "Technical Interview",
    description: "Master coding & system design",
    icon: Brain,
    href: "/interview-preparation/technical",
    color: "text-orange-500",
    cost: "120 credits",
  },
  {
    title: "Mock Assessment",
    description: "Take AI-powered mock interviews",
    icon: Target,
    href: "/interview-preparation/mock",
    color: "text-green-500",
    cost: "80 credits",
  },
  {
    title: "Learning Path",
    description: "Structured interview preparation",
    icon: GraduationCap,
    href: "/resources/learning-path",
    color: "text-indigo-500",
    cost: "60 credits",
  },
  {
    title: "Performance Stats",
    description: "Track your interview progress",
    icon: LineChart,
    href: "/progress/stats",
    color: "text-pink-500",
    cost: "Free",
  },
];

export function QuickActions({ user }: QuickActionsProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Start your interview preparation journey
            </CardDescription>
          </div>
          <div className="flex items-center text-sm">
            <Sparkles className="mr-1 h-4 w-4 text-yellow-500" />
            <span className="font-medium">
              Available Credits: {user.credits}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative block"
            >
              <div className="relative h-[120px] w-full overflow-hidden rounded-xl border bg-background p-6 transition-all hover:border-primary hover:shadow-lg">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex h-full flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "w-fit rounded-lg bg-background p-2",
                          action.color,
                        )}
                      >
                        <action.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Sparkles className="mr-1 h-3 w-3" />
                        {action.cost}
                      </div>
                    </div>
                    <div>
                      <h3 className="truncate font-semibold">{action.title}</h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
