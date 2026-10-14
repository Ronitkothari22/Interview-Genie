import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mic, Video, Brain, Target } from "lucide-react";

const interviewTypes = [
  {
    title: "Audio Interview",
    description: "Practice with AI-powered voice interviews",
    icon: Mic,
    href: "/interview-preparation/audio",
    roles: [
      "Web Designer",
      "Software Development Intern",
      "Junior QA Analyst",
      "DevOps Architect",
      // Add more roles as needed
    ],
  },
  {
    title: "Video Interview",
    description:
      "Practice with AI video interviews with posture and expression analysis",
    icon: Video,
    href: "/interview-preparation/video",
    roles: [
      "Lead Full-Stack Developer",
      "Principal Cloud Architect",
      "Creative Director",
      "Front-End Developer",
      // Add more roles as needed
    ],
  },
  {
    title: "Technical Interview",
    description: "Practice coding and system design interviews",
    icon: Brain,
    href: "/interview-preparation/technical",
    roles: [
      "Data Analyst",
      "QA Engineer",
      "Junior Security Analyst",
      "Front-End Development Lead",
      // Add more roles as needed
    ],
  },
  {
    title: "Behavioral Interview",
    description: "Master common behavioral and situational questions",
    icon: Target,
    href: "/interview-preparation/behavioral",
    roles: [
      "Junior Software Developer",
      "Lead Software Developer",
      "Lead Data Engineer",
      "Senior Security Analyst",
      // Add more roles as needed
    ],
  },
];

export function InterviewPreparationTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {interviewTypes.map((type) => (
        <Card key={type.title} className="hover:bg-muted/50">
          <Link href={type.href}>
            <CardHeader>
              <type.icon className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">{type.title}</CardTitle>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium">Available Roles:</div>
                <div className="text-sm text-muted-foreground">
                  {type.roles.slice(0, 3).join(", ")}
                  {type.roles.length > 3 && "..."}
                </div>
                <div className="mt-2 text-sm text-primary">
                  Click to explore →
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
