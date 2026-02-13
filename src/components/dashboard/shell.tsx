interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return <div className="flex-1 space-y-8">{children}</div>;
}
