import { Skeleton } from "../../ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting */}
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-lg lg:col-span-2" />
        <Skeleton className="h-48 rounded-lg" />
      </div>

      {/* Activity feed */}
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
