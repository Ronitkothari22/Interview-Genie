"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Alert = {
  timestamp: string;
  message: string;
  type: "error" | "warning";
};

export function AlertHistory() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/health");
        const health = await res.json();

        if (!mounted) return;

        // Generate alerts based on health check results
        const newAlerts: Alert[] = [];

        if (!health.redis.ok) {
          newAlerts.push({
            timestamp: new Date().toLocaleString(),
            message: "Redis connection issue detected",
            type: "error",
          });
        }

        if (health.latency > 1000) {
          newAlerts.push({
            timestamp: new Date().toLocaleString(),
            message: "High API latency detected",
            type: "warning",
          });
        }

        if (!health.database.ok) {
          newAlerts.push({
            timestamp: new Date().toLocaleString(),
            message: "Database connection issue detected",
            type: "error",
          });
        }

        if (newAlerts.length > 0) {
          setAlerts((prev) => [...newAlerts, ...prev].slice(0, 10)); // Keep last 10 alerts
        }
      } catch (error) {
        console.error("Failed to fetch health data:", error);
      }
    };

    // Initial fetch
    void fetchAlerts();

    // Set up interval
    const interval = setInterval(() => {
      void fetchAlerts();
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
        <CardTitle>Alert History</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alerts to display</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert, i) => (
                <TableRow key={i}>
                  <TableCell>{alert.timestamp}</TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        alert.type === "error" ? "destructive" : "secondary"
                      }
                    >
                      {alert.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
