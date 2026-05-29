import { Skeleton } from "../../ui/skeleton";

export function FloorGridSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      {/* Zone sections */}
      {Array.from({ length: 2 }).map((_, z) => (
        <div key={z} className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
    </div>
  );
}
