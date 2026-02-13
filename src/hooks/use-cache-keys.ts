import { CACHE_KEYS } from "@/server/redis";

export const cacheKeys = {
  dashboard: (userId: string) => `/api/dashboard?userId=${userId}`,
  resumeAnalyses: (userId: string) => `/api/resumes/analyses?userId=${userId}`,
  practiceSessions: (userId: string) =>
    `/api/practice/sessions?userId=${userId}`,
  user: (userId: string) => `${CACHE_KEYS.USER}:${userId}`,
} as const;

export type CacheKey = keyof typeof cacheKeys;

// Mutation utilities for optimistic updates
export const mutationUtils = {
  // Update dashboard data optimistically
  updateDashboard: (oldData: any, newData: any) => ({
    ...oldData,
    ...newData,
  }),

  // Update resume analyses optimistically
  updateResumeAnalyses: (oldData: any, newAnalysis: any) => ({
    ...oldData,
    analyses: [newAnalysis, ...(oldData?.analyses || [])],
  }),

  // Update practice sessions optimistically
  updatePracticeSessions: (oldData: any, newSession: any) => ({
    ...oldData,
    sessions: [newSession, ...(oldData?.sessions || [])],
  }),
};
