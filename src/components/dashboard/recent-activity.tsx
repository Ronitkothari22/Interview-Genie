"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy,
  Video,
  FileText,
  Target,
  Clock,
  Star,
  Sparkles,
  Medal,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    title: "Video Interview Completed",
    description: "Lead Full-Stack Developer position",
    timestamp: "2 hours ago",
    icon: Video,
    color: "text-purple-500",
    score: "92",
    rewards: {
      xp: 100,
      credits: 20,
      achievement: "Interview Master",
    },
    feedback: "Excellent communication skills!",
  },
  {
    title: "Achievement Unlocked",
    description: "Completed 5 mock interviews",
    timestamp: "5 hours ago",
    icon: Trophy,
    color: "text-yellow-500",
    rewards: {
      xp: 200,
      badge: "Interview Pro",
    },
    milestone: "5/10 to next level",
  },
  {
    title: "Resume Updated",
    description: "Added new work experience",
    timestamp: "1 day ago",
    icon: FileText,
    color: "text-blue-500",
    rewards: {
      xp: 50,
      credits: 10,
    },
    feedback: "Profile strength increased!",
  },
  {
    title: "Behavioral Interview",
    description: "Software Engineer position",
    timestamp: "2 days ago",
    icon: Target,
    color: "text-green-500",
    score: "88",
    rewards: {
      xp: 80,
      credits: 15,
    },
    feedback: "Great problem-solving approach!",
  },
  {
    title: "Practice Session",
    description: "Technical interview preparation",
    timestamp: "3 days ago",
    icon: Clock,
    color: "text-orange-500",
    duration: "45m",
    rewards: {
      xp: 60,
      credits: 10,
    },
    feedback: "Keep practicing!",
  },
];

interface RecentActivityProps {
  className?: string;
}

export function RecentActivity({ className }: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Activity</span>
          <Badge variant="secondary" className="font-normal">
            <Trophy className="mr-1 h-3 w-3" />
            Level 5
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="group relative flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
            >
              <div
                className={cn(
                  "rounded-full bg-background p-2 transition-transform group-hover:scale-110",
                  activity.color,
                )}
              >
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-2">
                    {activity.score && (
                      <div className="flex items-center text-yellow-500 animate-in slide-in-from-right-5">
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        <span className="text-xs font-medium">
                          {activity.score}
                        </span>
                      </div>
                    )}
                    {activity.duration && (
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span className="text-xs">{activity.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </p>
                  {activity.rewards && (
                    <div className="hidden items-center gap-2 text-xs text-primary animate-in slide-in-from-right-5 group-hover:flex">
                      {activity.rewards.xp && (
                        <Badge variant="outline" className="h-5 px-1">
                          <Sparkles className="mr-1 h-3 w-3" />+
                          {activity.rewards.xp} XP
                        </Badge>
                      )}
                      {activity.rewards.credits && (
                        <Badge variant="outline" className="h-5 px-1">
                          <Award className="mr-1 h-3 w-3" />+
                          {activity.rewards.credits} Credits
                        </Badge>
                      )}
                      {activity.rewards.badge && (
                        <Badge variant="outline" className="h-5 px-1">
                          <Medal className="mr-1 h-3 w-3" />
                          {activity.rewards.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                {(activity.feedback ?? activity.milestone) && (
                  <div className="mt-2 hidden text-xs text-primary animate-in fade-in-0 group-hover:block">
                    {activity.feedback && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {activity.feedback}
                      </div>
                    )}
                    {activity.milestone && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        {activity.milestone}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
