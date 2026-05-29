import { Skeleton } from "../../ui/skeleton";

export function BookingListSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Skeleton className="h-8 w-40" />

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Booking cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
