"use client";

import { DashboardShell } from "@/components/dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardError() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check if there's an actual error
    const checkError = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          setHasError(true);
        }
      } catch (error: unknown) {
        console.error("Dashboard error:", error);
        setHasError(true);
      }
    };

    void checkError();
  }, []);

  if (!hasError) return null;

  return (
    <DashboardShell>
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem loading the dashboard.
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </DashboardShell>
  );
}
