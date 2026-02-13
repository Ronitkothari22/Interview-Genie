"use client";

import { Card } from "@/components/ui/card";

const interviewTypes = [
  {
    title: "Technical Interview",
    description: "Practice coding and system design questions",
    icon: "CodeIcon",
  },
  {
    title: "Behavioral Interview",
    description: "STAR method responses and soft skills",
    icon: "UserGroupIcon",
  },
  {
    title: "HR Interview",
    description: "Common HR and cultural fit questions",
    icon: "BuildingIcon",
  },
];

export function InterviewTypes() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {interviewTypes.map((type) => (
        <Card key={type.title} className="p-6">
          <h3 className="text-xl font-semibold">{type.title}</h3>
          <p className="text-muted-foreground">{type.description}</p>
        </Card>
      ))}
    </div>
  );
}
