import { DashboardShell } from "@/components/dashboard";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
  content,
  loading,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  loading: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <Suspense fallback={loading}>
        {content}
        {children}
      </Suspense>
    </DashboardShell>
  );
}
