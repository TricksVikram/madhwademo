import type { Desk, Room, Floor, Zone, User, Team, Booking } from "./types";

export function getDesksForFloor(desks: Desk[], floorId: string): Desk[] {
  return desks.filter((d) => d.floorId === floorId);
}

export function getDesksForZone(desks: Desk[], zoneId: string): Desk[] {
  return desks.filter((d) => d.zoneId === zoneId);
}

export function getRoomsForFloor(rooms: Room[], floorId: string): Room[] {
  return rooms.filter((r) => r.floorId === floorId);
}

export function getZonesForFloor(zones: Zone[], floorId: string): Zone[] {
  return zones.filter((z) => z.floorId === floorId);
}

export function getBookingsForDate(
  bookings: Booking[],
  date: string
): Booking[] {
  return bookings.filter((b) => b.date === date);
}

export function getBookingsForUser(
  bookings: Booking[],
  userId: string
): Booking[] {
  return bookings.filter((b) => b.userId === userId);
}

export function getBookingsForResource(
  bookings: Booking[],
  resourceId: string
): Booking[] {
  return bookings.filter((b) => b.resourceId === resourceId);
}

/**
 * Returns desks that have no overlapping active bookings for the given
 * date and time range.
 */
export function getAvailableDesks(
  desks: Desk[],
  bookings: Booking[],
  date: string,
  startTime: string,
  endTime: string
): Desk[] {
  const activeBookings = bookings.filter(
    (b) =>
      b.date === date &&
      b.resourceType === "desk" &&
      b.status !== "cancelled" &&
      b.status !== "auto-released" &&
      b.status !== "completed" &&
      timesOverlap(b.startTime, b.endTime, startTime, endTime)
  );

  const bookedDeskIds = new Set(activeBookings.map((b) => b.resourceId));

  return desks.filter(
    (d) => d.status !== "maintenance" && !bookedDeskIds.has(d.id)
  );
}

export function getUserById(
  users: User[],
  id: string
): User | undefined {
  return users.find((u) => u.id === id);
}

export function getTeamById(
  teams: Team[],
  id: string
): Team | undefined {
  return teams.find((t) => t.id === id);
}

export function getFloorById(
  floors: Floor[],
  id: string
): Floor | undefined {
  return floors.find((f) => f.id === id);
}

export function getZoneById(
  zones: Zone[],
  id: string
): Zone | undefined {
  return zones.find((z) => z.id === id);
}

// ── Internal helpers ────────────────────────

function timesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
