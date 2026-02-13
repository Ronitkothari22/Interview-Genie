interface DashboardHeaderProps {
  user: any;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          Welcome back, {user.name}
        </span>
      </div>
    </div>
  );
}
