import { Suspense } from "react";
import { HealthMetrics } from "@/components/health/metrics";
import { SystemStatus } from "@/components/health/system-status";
import { AlertHistory } from "@/components/health/alert-history";

export default function HealthPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-muted-foreground">
          Monitor system performance and health metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Loading system status...</div>}>
          <SystemStatus />
        </Suspense>

        <Suspense fallback={<div>Loading metrics...</div>}>
          <HealthMetrics />
        </Suspense>
      </div>

      <Suspense fallback={<div>Loading alert history...</div>}>
        <AlertHistory />
      </Suspense>
    </div>
  );
}
