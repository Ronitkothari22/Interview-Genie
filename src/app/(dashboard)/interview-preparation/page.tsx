"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Video, Mic, Brain, Users, FileText, Sparkles, Presentation } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

const interviewTypes = [
  {
    icon: FileText,
    title: "Job Description",
    description: "Generate interview questions based on job descriptions",
    href: "/interview-preparation/job-descriptions",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hoverColor: "group-hover:bg-blue-500/20",
    cost: "50 credits",
  },
  {
    icon: Video,
    title: "Video Interview",
    description: "Practice with video interviews",
    href: "/interview-preparation/video",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    hoverColor: "group-hover:bg-purple-500/20",
    cost: "100 credits",
  },
  {
    icon: Mic,
    title: "Audio Interview",
    description: "Practice with audio interviews",
    href: "/interview-preparation/audio",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    hoverColor: "group-hover:bg-pink-500/20",
    cost: "80 credits",
  },
  {
    icon: Brain,
    title: "Technical Interview",
    description: "Practice coding interviews",
    href: "/interview-preparation/technical",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    hoverColor: "group-hover:bg-green-500/20",
    cost: "120 credits",
  },
  {
    icon: Users,
    title: "Behavioral Interview",
    description: "Practice behavioral questions",
    href: "/interview-preparation/behavioral",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    hoverColor: "group-hover:bg-orange-500/20",
    cost: "60 credits",
  },
];

export default function InterviewPreparationPage() {
  const breadcrumbItems = [
    {
      href: "/interview-preparation",
      label: "Interview Preparation",
      icon: Presentation,
    },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Interview Preparation
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose an interview type to practice
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {interviewTypes.map((type) => {
          const Icon = type.icon;
          return (
            <motion.div key={type.title} variants={item}>
              <Link href={type.href} className="block">
                <Card className="group h-full transition-all hover:border-primary hover:shadow-lg">
                  <div className="relative h-full p-6">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative space-y-4">
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "w-fit rounded-lg p-2.5 transition-colors duration-300",
                            type.bgColor,
                            type.hoverColor,
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-6 w-6 transition-transform group-hover:scale-110",
                              type.color,
                            )}
                          />
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Sparkles className="mr-1 h-4 w-4" />
                          {type.cost}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 text-lg font-semibold">
                          {type.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
