"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statCards = [
  {
    title: "Total Interviews",
    metric: "0",
    description: "Mock interviews completed",
    trend: "+12% from last month",
  },
  {
    title: "Average Score",
    metric: "0",
    description: "Across all interviews",
    trend: "+4% from last month",
  },
  {
    title: "Practice Hours",
    metric: "0",
    description: "Total time spent practicing",
    trend: "+2.5 hrs from last week",
  },
];

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.metric}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
            <p className="text-xs text-green-500">{stat.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
