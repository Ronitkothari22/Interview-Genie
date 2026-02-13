import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { PracticeSession, PracticeStats } from "@prisma/client";

interface UsePracticeTimeProps {
  onSessionStart?: (session: PracticeSession) => void;
  onSessionEnd?: (data: {
    session: PracticeSession;
    stats: PracticeStats;
  }) => void;
}

export function usePracticeTime({
  onSessionStart,
  onSessionEnd,
}: UsePracticeTimeProps = {}) {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(
    null,
  );
  const [isActive, setIsActive] = useState(false);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const startPingInterval = useCallback(() => {
    clearPingInterval();
    // Ping every 25 seconds to keep the session alive
    pingIntervalRef.current = setInterval(() => {
      if (!currentSession?.id) return;

      void (async () => {
        try {
          const response = await fetch("/api/practice/ping", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: currentSession.id,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to ping session");
          }
        } catch (error) {
          console.error("Ping error:", error);
          setError(
            error instanceof Error ? error.message : "Failed to ping session",
          );
        }
      })();
    }, 25000);
  }, [clearPingInterval, currentSession?.id]);

  const startSession = useCallback(
    async (sessionType: string) => {
      if (!session?.user?.id) {
        setError("User not authenticated");
        return;
      }

      try {
        const response = await fetch("/api/practice/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session.user.id,
            sessionType,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to start session");
        }

        const data = await response.json();
        setCurrentSession(data.session);
        setIsActive(true);
        onSessionStart?.(data.session);
        startPingInterval();
      } catch (error) {
        console.error("Failed to start session:", error);
        setError(
          error instanceof Error ? error.message : "Failed to start session",
        );
      }
    },
    [session?.user?.id, onSessionStart, startPingInterval],
  );

  const endSession = useCallback(async () => {
    if (!currentSession?.id) {
      setError("No active session");
      return;
    }

    try {
      const response = await fetch("/api/practice/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to end session");
      }

      const data = await response.json();
      setCurrentSession(null);
      setIsActive(false);
      onSessionEnd?.(data);
      clearPingInterval();
    } catch (error) {
      console.error("Failed to end session:", error);
      setError(
        error instanceof Error ? error.message : "Failed to end session",
      );
    }
  }, [currentSession?.id, onSessionEnd, clearPingInterval]);

  useEffect(() => {
    return () => {
      clearPingInterval();
    };
  }, [clearPingInterval]);

  return {
    startSession,
    endSession,
    isActive,
    error,
    currentSession,
  };
}
