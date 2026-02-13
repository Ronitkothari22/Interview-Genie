"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const feedbackMetrics = [
  { label: "Technical Knowledge", score: 85 },
  { label: "Communication", score: 78 },
  { label: "Body Language", score: 92 },
  { label: "Response Quality", score: 88 },
];

export function FeedbackPanel() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Real-time Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedbackMetrics.map((metric) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{metric.label}</span>
                <span className="text-sm text-muted-foreground">
                  {metric.score}%
                </span>
              </div>
              <Progress value={metric.score} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
