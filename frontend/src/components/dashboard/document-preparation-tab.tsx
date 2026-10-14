import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, FileUp, LinkedinIcon, Zap } from "lucide-react";

const features = [
  {
    title: "Resume Builder",
    description: "Create a professional resume with our AI-powered builder",
    icon: FileText,
    href: "/document-preparation/resume-builder",
  },
  {
    title: "Resume Optimizer",
    description: "Optimize your resume for ATS with AI suggestions",
    icon: Zap,
    href: "/document-preparation/resume-optimizer",
  },
  {
    title: "LinkedIn Optimizer",
    description: "Optimize your LinkedIn profile for ATS",
    icon: LinkedinIcon,
    href: "/document-preparation/linkedin-optimizer",
  },
  {
    title: "Resume Upload",
    description: "Upload your existing resume for AI analysis and optimization",
    icon: FileUp,
    href: "/document-preparation/resume-upload",
  },
];

export function DocumentPreparationTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {features.map((feature) => (
        <Card key={feature.title} className="hover:bg-muted/50">
          <Link href={feature.href}>
            <CardHeader>
              <feature.icon className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Click to get started →
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
