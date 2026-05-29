import type { Booking, ResourceStatus } from "./types";

export type ResolvedStatus = "available" | "booked" | "occupied" | "maintenance";

/**
 * Determines a resource's current display status based on its base status,
 * bookings, and the current time.
 */
export function getResourceStatus(
  resourceId: string,
  resourceBaseStatus: ResourceStatus,
  bookings: Booking[],
  currentTime: Date
): ResolvedStatus {
  if (resourceBaseStatus === "maintenance") return "maintenance";

  const now = currentTime;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayBookings = bookings.filter(
    (b) =>
      b.resourceId === resourceId &&
      b.date === todayStr &&
      b.status !== "cancelled" &&
      b.status !== "auto-released" &&
      b.status !== "completed"
  );

  // Check for occupied (checked-in and currently active)
  for (const b of todayBookings) {
    if (b.status === "checked-in") {
      const [sh, sm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      if (currentMinutes >= sh * 60 + sm && currentMinutes < eh * 60 + em) {
        return "occupied";
      }
    }
  }

  // Check for booked (upcoming within 30 min window)
  for (const b of todayBookings) {
    if (b.status === "upcoming") {
      const [sh, sm] = b.startTime.split(":").map(Number);
      const startMin = sh * 60 + sm;
      const [eh, em] = b.endTime.split(":").map(Number);
      const endMin = eh * 60 + em;
      // Active upcoming or starting within 30 min
      if (
        (currentMinutes >= startMin && currentMinutes < endMin) ||
        (startMin > currentMinutes && startMin - currentMinutes <= 30)
      ) {
        return "booked";
      }
    }
  }

  return "available";
}

const STATUS_COLORS: Record<ResolvedStatus, string> = {
  available: "text-chart-2",
  booked: "text-primary",
  occupied: "text-chart-4",
  maintenance: "text-muted-foreground",
};

const STATUS_BG_COLORS: Record<ResolvedStatus, string> = {
  available: "bg-chart-2",
  booked: "bg-primary",
  occupied: "bg-chart-4",
  maintenance: "bg-muted-foreground",
};

export function getResourceStatusColor(status: ResolvedStatus): string {
  return STATUS_COLORS[status];
}

export function getResourceStatusBgColor(status: ResolvedStatus): string {
  return STATUS_BG_COLORS[status];
}
