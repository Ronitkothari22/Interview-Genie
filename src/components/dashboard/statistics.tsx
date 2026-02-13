"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy,
  Target,
  Clock,
  Sparkles,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { usePracticeTime } from "@/hooks/use-practice-time";

interface StatData {
  value: string;
  trend: string;
  trendType: "positive" | "negative";
  nextMilestone: string;
  progress: number;
}

interface Stats {
  totalScore: StatData;
  interviews: StatData;
  practiceTime: StatData;
  credits: StatData;
}

const statConfig = {
  totalScore: {
    title: "Total Score",
    description: "Average performance",
    icon: Trophy,
    color: "text-yellow-500",
    reward: "+50 XP",
  },
  interviews: {
    title: "Interviews",
    description: "Completed sessions",
    icon: Target,
    color: "text-blue-500",
    reward: "+20 Credits",
  },
  practiceTime: {
    title: "Practice Time",
    description: "Total duration",
    icon: Clock,
    color: "text-green-500",
    reward: "New Badge",
  },
  credits: {
    title: "Credits",
    description: "Available balance",
    icon: Sparkles,
    color: "text-purple-500",
    reward: "Premium Feature",
  },
};

export function Statistics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isActive } = usePracticeTime();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/statistics");
        if (!response.ok) throw new Error("Failed to fetch statistics");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStats();

    // If practice is active, refresh stats every minute
    if (isActive) {
      const interval = setInterval(() => {
        void fetchStats();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  // Show loading state
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(statConfig).map(([key, config]) => (
          <Card key={key} className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {config.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <config.icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    config.color,
                  )}
                />
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-8 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-2 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {(Object.keys(stats) as Array<keyof Stats>).map((key) => {
        const stat = stats[key];
        const config = statConfig[key];

        return (
          <Card key={key} className="group relative overflow-hidden">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {config.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <config.icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    config.color,
                  )}
                />
                {config.reward && (
                  <div className="hidden items-center text-xs font-medium text-primary animate-in slide-in-from-right-5 group-hover:flex">
                    <Star className="mr-1 h-3 w-3" />
                    {config.reward}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div
                  className={cn(
                    "flex items-center text-xs font-medium",
                    stat.trendType === "positive"
                      ? "text-green-500"
                      : "text-red-500",
                  )}
                >
                  {stat.trendType === "positive" ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {stat.trend}
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {config.description}
              </p>

              {/* Progress to Next Milestone */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Next: {stat.nextMilestone}
                  </span>
                  <span className="font-medium">{stat.progress}%</span>
                </div>
                <Progress
                  value={stat.progress}
                  className="h-1 transition-all group-hover:h-2"
                >
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      stat.progress >= 100
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : stat.progress >= 75
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                          : stat.progress >= 50
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                            : "bg-gradient-to-r from-red-500 to-pink-500",
                    )}
                    style={{ width: `${stat.progress}%` }}
                  />
                </Progress>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
