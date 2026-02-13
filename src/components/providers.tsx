"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      forcedTheme={undefined}
      storageKey="interview-genie-theme"
    >
      <QueryProvider>
        <SessionProvider>
          {children}
          <Toaster richColors closeButton position="bottom-right" />
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
