"use client";

import { Suspense } from "react";
import { Statistics } from "./statistics";
import { FeatureNav } from "./feature-nav";
import { QuickActions } from "./quick-actions";
import { DashboardLoadingSkeleton } from "./loading-skeleton";

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  credits: number;
  subscriptionStatus: string;
  isVerified: boolean;
}

interface DashboardContentProps {
  children?: React.ReactNode;
  user: User;
}

export function DashboardContent({ children, user }: DashboardContentProps) {
  return (
    <div className="flex-1 space-y-8">
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Track your progress and manage your interview preparation
          </p>
        </div>

        <Statistics />

        <div className="space-y-8">
          {/* Document Preparation and Interview Preparation */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FeatureNav type="document" />
            <FeatureNav type="interview" />
          </div>

          {/* Resources and Progress & Analytics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FeatureNav type="resources" />
            <FeatureNav type="progress" />
          </div>

          {/* Quick Actions */}
          <QuickActions user={user} />

          {children}
        </div>
      </Suspense>
    </div>
  );
}
