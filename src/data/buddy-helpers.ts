import type { Booking, Desk } from "./types";

/**
 * Find nearby available desks in the same zone, falling back to same floor.
 * Desks are sorted by label to simulate physical proximity.
 */
export function findNearbyDesks(
  allDesks: Desk[],
  bookings: Booking[],
  zoneId: string,
  floorId: string,
  count: number,
  date: string,
  startTime: string,
  endTime: string
): Desk[] {
  const bookedIds = new Set(
    bookings
      .filter(
        (b) =>
          b.date === date &&
          b.resourceType === "desk" &&
          b.status !== "cancelled" &&
          b.status !== "auto-released" &&
          b.status !== "completed" &&
          b.startTime < endTime &&
          b.endTime > startTime
      )
      .map((b) => b.resourceId)
  );

  const isAvailable = (d: Desk) =>
    d.status !== "maintenance" && !bookedIds.has(d.id);

  // Try same zone first
  const zoneDesks = allDesks
    .filter((d) => d.zoneId === zoneId && isAvailable(d))
    .sort((a, b) => a.label.localeCompare(b.label));

  if (zoneDesks.length >= count) return zoneDesks.slice(0, count);

  // Fall back to same floor
  const floorDesks = allDesks
    .filter((d) => d.floorId === floorId && isAvailable(d))
    .sort((a, b) => {
      // Prioritize same zone
      if (a.zoneId === zoneId && b.zoneId !== zoneId) return -1;
      if (b.zoneId === zoneId && a.zoneId !== zoneId) return 1;
      return a.label.localeCompare(b.label);
    });

  if (floorDesks.length >= count) return floorDesks.slice(0, count);

  return floorDesks; // Return what we have, caller checks count
}
