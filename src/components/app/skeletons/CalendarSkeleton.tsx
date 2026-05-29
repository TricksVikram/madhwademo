import { Skeleton } from "../../ui/skeleton";

export function CalendarSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Time grid */}
      <div className="space-y-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-12 w-14 shrink-0" />
            <Skeleton className="h-12 flex-1 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
