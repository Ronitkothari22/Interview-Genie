"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
        classNames: {
          toast: "rounded-lg border-border shadow-lg group",
          success: "bg-emerald-50 text-emerald-800 border-emerald-200",
          error: "bg-destructive/5 text-destructive border-destructive/20",
          loading: "bg-muted text-muted-foreground border-input",
        },
        duration: 4000,
      }}
      closeButton
      richColors
      expand
      theme="light"
    />
  );
}
