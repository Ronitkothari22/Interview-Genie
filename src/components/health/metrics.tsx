"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function HealthMetrics() {
  const [data, setData] = useState<
    Array<{ timestamp: string; latency: number }>
  >([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/health");
        const health = await res.json();

        if (!mounted) return;

        setData((prev) => {
          const newData = [
            ...prev,
            {
              timestamp: new Date().toLocaleTimeString(),
              latency: health.latency ?? 0,
            },
          ].slice(-30); // Keep last 30 data points
          return newData;
        });
      } catch (error) {
        console.error("Failed to fetch health data:", error);
      }
    };

    // Initial fetch
    void fetchData();

    // Set up interval
    const interval = setInterval(() => {
      void fetchData();
    }, 30000);

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="latency" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
