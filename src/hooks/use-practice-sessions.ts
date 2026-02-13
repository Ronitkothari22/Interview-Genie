import useSWR from "swr";
import type { PracticeSessionBatch } from "@/lib/batch-queries";
import { fetcher } from "./use-fetcher";
import { cacheKeys, mutationUtils } from "./use-cache-keys";
import { useSession } from "next-auth/react";

export function usePracticeSessions() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data, error, isLoading, mutate } = useSWR<PracticeSessionBatch>(
    userId ? cacheKeys.practiceSessions(userId) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3,
      fallbackData: {
        sessions: [],
        totalDuration: 0,
        averageScore: 0,
        completionRate: 0,
      },
    },
  );

  const updateSessions = async (newSession: any) => {
    // Optimistically update the cache
    await mutate(mutationUtils.updatePracticeSessions(data, newSession), {
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
    mutate: updateSessions,
  };
}
