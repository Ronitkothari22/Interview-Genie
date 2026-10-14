import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target, Clock, Sparkles } from "lucide-react";

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      {/* Statistics Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Trophy, color: "text-yellow-500" },
          { icon: Target, color: "text-blue-500" },
          { icon: Clock, color: "text-green-500" },
          { icon: Sparkles, color: "text-purple-500" },
        ].map((stat, index) => (
          <Card key={index} className="group relative overflow-hidden">
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between space-y-0">
                <Skeleton className="h-4 w-[100px]" />
                <div className="flex items-center gap-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-4 w-[140px]" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-[80px]" />
                  <Skeleton className="h-3 w-[40px]" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Feature Navigation Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[140px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[60px]" />
                    <Skeleton className="h-6 w-[80px]" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <Card>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Activity Skeleton */}
      <Card>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-6 w-[80px]" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[160px]" />
                </div>
                <Skeleton className="h-4 w-[60px]" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
