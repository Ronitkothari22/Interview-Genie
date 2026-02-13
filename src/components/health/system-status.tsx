"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatusCardProps {
  title: string;
  value: string;
  status: "healthy" | "warning" | "error";
}

function StatusCard({ title, value, status }: StatusCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{title}</p>
          <Badge
            variant={
              status === "healthy"
                ? "default"
                : status === "warning"
                  ? "secondary"
                  : "destructive"
            }
          >
            {status}
          </Badge>
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function SystemStatus() {
  const [status, setStatus] = useState<{
    overall: "healthy" | "warning" | "error";
    latency: number;
    redis: boolean;
    database: boolean;
  }>({
    overall: "healthy",
    latency: 0,
    redis: true,
    database: true,
  });

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/health");
        const health = await res.json();

        if (!mounted) return;

        // Determine overall status
        let overall: "healthy" | "warning" | "error" = "healthy";

        if (!health.redis.ok || !health.database.ok) {
          overall = "error";
        } else if (health.latency > 1000) {
          overall = "warning";
        }

        setStatus({
          overall,
          latency: health.latency ?? 0,
          redis: health.redis.ok,
          database: health.database.ok,
        });
      } catch (error) {
        console.error("Failed to fetch health data:", error);
        setStatus((prev) => ({
          ...prev,
          overall: "error",
        }));
      }
    };

    // Initial fetch
    void fetchStatus();

    // Set up interval
    const interval = setInterval(() => {
      void fetchStatus();
    }, 30000);

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatusCard
        title="System Status"
        value={status.overall.toUpperCase()}
        status={status.overall}
      />
      <StatusCard
        title="API Latency"
        value={`${status.latency}ms`}
        status={status.latency > 1000 ? "warning" : "healthy"}
      />
      <StatusCard
        title="Redis Status"
        value={status.redis ? "Connected" : "Disconnected"}
        status={status.redis ? "healthy" : "error"}
      />
      <StatusCard
        title="Database Status"
        value={status.database ? "Connected" : "Disconnected"}
        status={status.database ? "healthy" : "error"}
      />
    </div>
  );
}
