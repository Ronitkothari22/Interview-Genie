import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Clock, Star, Trophy } from "lucide-react";

// This would come from the API in a real app
const mockUserProgress = {
  level: 5,
  xp: 2750,
  xpToNextLevel: 5000,
  credits: 150,
  stats: {
    interviewsCompleted: 12,
    averageScore: 85,
    totalPracticeTime: "15h 30m",
    strengths: ["Technical Knowledge", "Problem Solving", "Communication"],
  },
  recentAchievements: [
    {
      title: "Interview Master",
      description: "Complete 10 mock interviews",
      icon: Trophy,
      earned: true,
    },
    {
      title: "Quick Learner",
      description: "Achieve 90%+ score in 3 consecutive interviews",
      icon: Star,
      earned: true,
    },
    {
      title: "Dedicated",
      description: "Practice for 20+ hours",
      icon: Clock,
      earned: false,
    },
    {
      title: "All-Rounder",
      description: "Complete all interview types",
      icon: Award,
      earned: false,
    },
  ],
};

export function ProgressTab() {
  const { level, xp, xpToNextLevel, credits, stats, recentAchievements } =
    mockUserProgress;
  const xpProgress = (xp / xpToNextLevel) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Level and XP Card */}
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle>Level {level}</CardTitle>
          <CardDescription>Your Progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP: {xp}</span>
              <span>{xpToNextLevel - xp} XP to next level</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>
          <div className="text-sm">
            Available Credits: <span className="font-bold">{credits}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>Your interview performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Interviews</div>
              <div className="text-2xl font-bold">
                {stats.interviewsCompleted}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Avg. Score</div>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
            </div>
            <div>
              <div className="text-sm font-medium">Practice Time</div>
              <div className="text-2xl font-bold">
                {stats.totalPracticeTime}
              </div>
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-medium">Key Strengths:</div>
            <div className="flex flex-wrap gap-2">
              {stats.strengths.map((strength) => (
                <span
                  key={strength}
                  className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Your earned badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.title}
                className={`flex items-center space-x-4 rounded-lg p-2 ${
                  achievement.earned ? "bg-primary/10" : "bg-muted"
                }`}
              >
                <achievement.icon
                  className={`h-8 w-8 ${
                    achievement.earned
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <div>
                  <div className="font-medium">{achievement.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
