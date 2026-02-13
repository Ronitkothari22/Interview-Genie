import useSWR from "swr";
import type { DashboardData } from "@/lib/batch-queries";
import { fetcher } from "./use-fetcher";
import { cacheKeys, mutationUtils } from "./use-cache-keys";
import { useSession } from "next-auth/react";

export function useDashboardData() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    userId ? cacheKeys.dashboard(userId) : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't revalidate on window focus
      revalidateOnReconnect: true, // Revalidate when browser regains connection
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3,
      fallbackData: {
        user: session?.user as any,
        stats: null,
        recentSessions: [],
        resumeCount: 0,
      },
    },
  );

  const updateDashboard = async (newData: Partial<DashboardData>) => {
    // Optimistically update the cache
    await mutate(mutationUtils.updateDashboard(data, newData), {
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
    mutate: updateDashboard,
  };
}
