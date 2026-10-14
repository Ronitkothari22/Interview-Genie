"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { type TabId, getPreviousTab, getNextTab } from "@/lib/resume-tabs";
import { Loader2, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SectionNavigationProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  isValid?: boolean;
  isSaving?: boolean;
  onSave?: () => Promise<void>;
  validationErrors?: Array<{ field: string; message: string }>;
  className?: string;
}

export function SectionNavigation({
  currentTab,
  onTabChange,
  isValid = true,
  isSaving = false,
  onSave,
  validationErrors = [],
  className,
}: SectionNavigationProps): React.JSX.Element {
  const previousTab = getPreviousTab(currentTab);
  const nextTab = getNextTab(currentTab);

  const handleNext = async () => {
    if (onSave) {
      await onSave();
    }
    if (nextTab) {
      onTabChange(nextTab);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4">
                {validationErrors.map((error, index) => (
                  <li key={index}>
                    {error.field}: {error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        {previousTab ? (
          <Button
            variant="ghost"
            onClick={() => onTabChange(previousTab)}
            disabled={isSaving}
            className="gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
        ) : (
          <div />
        )}

        {nextTab && (
          <Button
            className={cn(
              "group relative transition-all duration-300 ease-out hover:pl-4 hover:pr-6",
              "bg-gradient-to-r from-primary to-primary/90",
              "text-primary-foreground shadow-lg hover:shadow-primary/25",
              "disabled:from-gray-400 disabled:to-gray-400/90",
            )}
            onClick={handleNext}
            disabled={!isValid || isSaving}
          >
            <div className="flex items-center gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </div>
            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/50 to-primary p-[1px] opacity-0 transition-opacity group-hover:opacity-100" />
          </Button>
        )}
      </div>
    </div>
  );
}
