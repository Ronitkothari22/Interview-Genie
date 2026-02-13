import useSWR from "swr";
import type { ResumeAnalysisBatch } from "@/lib/batch-queries";
import { fetcher } from "./use-fetcher";
import { cacheKeys, mutationUtils } from "./use-cache-keys";
import { useSession } from "next-auth/react";

export function useResumeAnalyses() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data, error, isLoading, mutate } = useSWR<ResumeAnalysisBatch>(
    userId ? cacheKeys.resumeAnalyses(userId) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3,
      fallbackData: {
        analyses: [],
        totalCount: 0,
        averageScore: 0,
      },
    },
  );

  const updateAnalyses = async (newAnalysis: any) => {
    // Optimistically update the cache
    await mutate(mutationUtils.updateResumeAnalyses(data, newAnalysis), {
      revalidate: false,
    });

    try {
      // Trigger revalidation
      await mutate();
    } catch (error) {
      // Revert on error
      await mutate();
      throw error;
    }
  };

  return {
    data,
    isLoading,
    isError: error,
    mutate: updateAnalyses,
  };
}
