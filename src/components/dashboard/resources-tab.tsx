import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Compass, GraduationCap, Library } from "lucide-react";

const resources = [
  {
    title: "Interview Guides",
    description: "Comprehensive guides for different interview types and roles",
    icon: BookOpen,
    href: "/resources/guides",
    topics: [
      "Technical Interview Guide",
      "Behavioral Questions Guide",
      "Remote Interview Tips",
      "Salary Negotiation Guide",
    ],
  },
  {
    title: "Learning Paths",
    description: "Structured learning paths for different career roles",
    icon: Compass,
    href: "/resources/learning-paths",
    topics: [
      "Frontend Development Path",
      "Backend Development Path",
      "DevOps Engineer Path",
      "Data Science Path",
    ],
  },
  {
    title: "Practice Questions",
    description: "Curated questions bank for self-practice",
    icon: GraduationCap,
    href: "/resources/practice",
    topics: [
      "Coding Problems",
      "System Design Questions",
      "Behavioral Scenarios",
      "Role-specific Questions",
    ],
  },
  {
    title: "Resource Library",
    description: "Additional resources and reference materials",
    icon: Library,
    href: "/resources/library",
    topics: [
      "Resume Templates",
      "Cover Letter Examples",
      "Industry Reports",
      "Career Insights",
    ],
  },
];

export function ResourcesTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {resources.map((resource) => (
        <Card key={resource.title} className="hover:bg-muted/50">
          <Link href={resource.href}>
            <CardHeader>
              <resource.icon className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium">Featured Topics:</div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {resource.topics.map((topic, index) => (
                    <li key={index} className="list-inside list-disc">
                      {topic}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-sm text-primary">
                  Explore resources →
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
