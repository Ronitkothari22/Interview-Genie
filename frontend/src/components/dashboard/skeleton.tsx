export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-1/4 animate-pulse rounded bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse space-y-2 rounded-lg bg-muted p-6"
          >
            <div className="h-4 w-1/2 rounded bg-muted-foreground/15" />
            <div className="h-8 w-3/4 rounded bg-muted-foreground/15" />
          </div>
        ))}
      </div>

      {/* Feature nav skeleton */}
      <div className="py-4">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse space-y-2 rounded-lg bg-muted p-6"
            >
              <div className="h-4 w-1/3 rounded bg-muted-foreground/15" />
              <div className="h-4 w-2/3 rounded bg-muted-foreground/15" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions and activity skeleton */}
      <div className="grid gap-6 md:grid-cols-7">
        <div className="space-y-4 md:col-span-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse space-y-2 rounded-lg bg-muted p-4"
            >
              <div className="h-4 w-1/4 rounded bg-muted-foreground/15" />
              <div className="h-4 w-1/2 rounded bg-muted-foreground/15" />
            </div>
          ))}
        </div>
        <div className="space-y-4 md:col-span-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse space-y-2 rounded-lg bg-muted p-4"
            >
              <div className="h-4 w-1/3 rounded bg-muted-foreground/15" />
              <div className="h-4 w-2/3 rounded bg-muted-foreground/15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
