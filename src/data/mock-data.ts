import { format, subDays, addDays } from "date-fns";
import type {
  Floor,
  Zone,
  Desk,
  Room,
  ParkingSpot,
  Locker,
  User,
  Team,
  Booking,
  Notification,
  WaitlistEntry,
  FloorLayout,
  CanvasObject,
} from "./types";

const today = format(new Date(), "yyyy-MM-dd");
const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
const twoDaysAgo = format(subDays(new Date(), 2), "yyyy-MM-dd");
const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
const nextWeek = format(addDays(new Date(), 5), "yyyy-MM-dd");

// ── Floors ──────────────────────────────────
export const floors: Floor[] = [
  { id: "floor-1", name: "Ground floor", level: 0 },
  { id: "floor-2", name: "First floor", level: 1 },
  { id: "floor-3", name: "Second floor", level: 2 },
];

// ── Zones ───────────────────────────────────
export const zones: Zone[] = [
  { id: "zone-1a", name: "Open workspace", floorId: "floor-1", color: "#6366F1", teamId: "team-eng" },
  { id: "zone-1b", name: "Quiet zone", floorId: "floor-1", color: "#8B5CF6" },
  { id: "zone-2a", name: "Collaboration hub", floorId: "floor-2", color: "#EC4899", teamId: "team-design" },
  { id: "zone-2b", name: "Focus pods", floorId: "floor-2", color: "#F59E0B" },
  { id: "zone-3a", name: "Executive area", floorId: "floor-3", color: "#10B981", teamId: "team-product" },
  { id: "zone-3b", name: "Creative studio", floorId: "floor-3", color: "#06B6D4" },
];

// ── Desks ───────────────────────────────────
function makeDesks(): Desk[] {
  const desks: Desk[] = [];
  const zoneIds = zones.map((z) => z.id);
  const floorMap: Record<string, string> = {};
  zones.forEach((z) => (floorMap[z.id] = z.floorId));

  const amenitiesList = [
    ["Monitor", "USB-C"],
    ["Dual monitor", "Standing desk"],
    ["Monitor"],
    ["USB-C", "Webcam"],
    ["Standing desk"],
  ];

  // Grid positions per zone (5 desks each, offset by zone index)
  const zoneGridOffsets: Record<string, { startX: number; startY: number }> = {
    "zone-1a": { startX: 1, startY: 1 },
    "zone-1b": { startX: 8, startY: 1 },
    "zone-2a": { startX: 1, startY: 1 },
    "zone-2b": { startX: 8, startY: 1 },
    "zone-3a": { startX: 1, startY: 1 },
    "zone-3b": { startX: 8, startY: 1 },
  };

  let idx = 1;
  for (const zoneId of zoneIds) {
    const count = 5;
    const offset = zoneGridOffsets[zoneId] || { startX: 0, startY: 0 };
    for (let i = 0; i < count; i++) {
      desks.push({
        id: `desk-${idx}`,
        label: `D-${idx.toString().padStart(2, "0")}`,
        zoneId,
        floorId: floorMap[zoneId],
        amenities: amenitiesList[i % amenitiesList.length],
        status: idx === 28 ? "maintenance" : "available",
        gridPosition: { x: offset.startX + (i % 5), y: offset.startY + Math.floor(i / 5) },
        assignedUserId: idx <= 8 ? `u-00${idx}` : undefined,
      });
      idx++;
    }
  }
  return desks;
}
export const desks: Desk[] = makeDesks();

// ── Floor layouts ───────────────────────────
export const floorLayouts: FloorLayout[] = [
  { floorId: "floor-1", gridWidth: 20, gridHeight: 14, canvasWidth: 1600, canvasHeight: 1000 },
  { floorId: "floor-2", gridWidth: 20, gridHeight: 14, canvasWidth: 1600, canvasHeight: 1000 },
  { floorId: "floor-3", gridWidth: 20, gridHeight: 14, canvasWidth: 1600, canvasHeight: 1000 },
];

// ── Meeting rooms ───────────────────────────
export const rooms: Room[] = [
  { id: "room-1", name: "Maple", floorId: "floor-1", capacity: 4, amenities: ["Whiteboard", "TV"], status: "available", gridPosition: { x: 14, y: 1 }, gridSize: { w: 3, h: 2 } },
  { id: "room-2", name: "Oak", floorId: "floor-1", capacity: 8, amenities: ["Whiteboard", "Video conferencing"], status: "available", gridPosition: { x: 14, y: 5 }, gridSize: { w: 4, h: 3 } },
  { id: "room-3", name: "Birch", floorId: "floor-2", capacity: 6, amenities: ["TV", "Whiteboard"], status: "available", gridPosition: { x: 14, y: 1 }, gridSize: { w: 3, h: 3 } },
  { id: "room-4", name: "Cedar", floorId: "floor-2", capacity: 12, amenities: ["Video conferencing", "Whiteboard", "Phone"], status: "available", gridPosition: { x: 14, y: 5 }, gridSize: { w: 4, h: 4 } },
  { id: "room-5", name: "Pine", floorId: "floor-3", capacity: 20, amenities: ["Projector", "Video conferencing", "Whiteboard"], status: "available", gridPosition: { x: 13, y: 1 }, gridSize: { w: 5, h: 4 } },
  { id: "room-6", name: "Elm", floorId: "floor-3", capacity: 2, amenities: ["TV"], status: "available", gridPosition: { x: 14, y: 7 }, gridSize: { w: 2, h: 2 } },
];

// ── Parking spots ───────────────────────────
export const parkingSpots: ParkingSpot[] = Array.from({ length: 10 }, (_, i) => ({
  id: `parking-${i + 1}`,
  label: `P-${(i + 1).toString().padStart(2, "0")}`,
  location: i < 5 ? "Basement level 1" : "Basement level 2",
  status: i === 7 ? "maintenance" as const : "available" as const,
}));

// ── Lockers ─────────────────────────────────
export const lockers: Locker[] = Array.from({ length: 10 }, (_, i) => ({
  id: `locker-${i + 1}`,
  label: `L-${(i + 1).toString().padStart(2, "0")}`,
  size: (["small", "medium", "large"] as const)[i % 3],
  location: i < 5 ? "Ground floor lobby" : "First floor corridor",
  status: "available" as const,
}));

// ── Teams ───────────────────────────────────
export const teams: Team[] = [
  { id: "team-eng", name: "Engineering", color: "#6366F1" },
  { id: "team-design", name: "Design", color: "#EC4899" },
  { id: "team-product", name: "Product", color: "#F59E0B" },
];

// ── Users ───────────────────────────────────
export const users: User[] = [
  { id: "u-001", name: "Jane Cooper", email: "jane.cooper@deskflow.io", avatar: "https://randomuser.me/api/portraits/women/44.jpg", teamId: "team-eng" },
  { id: "u-002", name: "Marcus Chen", email: "marcus.chen@deskflow.io", avatar: "https://randomuser.me/api/portraits/men/32.jpg", teamId: "team-eng" },
  { id: "u-003", name: "Priya Patel", email: "priya.patel@deskflow.io", avatar: "https://randomuser.me/api/portraits/women/65.jpg", teamId: "team-eng" },
  { id: "u-004", name: "Sofia Rodriguez", email: "sofia.rodriguez@deskflow.io", avatar: "https://randomuser.me/api/portraits/women/50.jpg", teamId: "team-design" },
  { id: "u-005", name: "Kai Tanaka", email: "kai.tanaka@deskflow.io", avatar: "https://randomuser.me/api/portraits/men/75.jpg", teamId: "team-design" },
  { id: "u-006", name: "Amara Johnson", email: "amara.johnson@deskflow.io", avatar: "https://randomuser.me/api/portraits/women/12.jpg", teamId: "team-product" },
  { id: "u-007", name: "Liam O'Brien", email: "liam.obrien@deskflow.io", avatar: "https://randomuser.me/api/portraits/men/22.jpg", teamId: "team-product" },
  { id: "u-008", name: "Zara Ahmed", email: "zara.ahmed@deskflow.io", avatar: "https://randomuser.me/api/portraits/women/28.jpg", teamId: "team-product" },
  { id: "u-admin-001", name: "Alex Admin", email: "alex.admin@deskflow.io", avatar: "https://randomuser.me/api/portraits/men/46.jpg", teamId: "team-product" },
];

// ── Bookings ────────────────────────────────
export const initialBookings: Booking[] = [
  { id: "bk-001", resourceType: "desk", resourceId: "desk-1", userId: "u-001", date: today, startTime: "09:00", endTime: "17:00", status: "upcoming", isRecurring: false, notes: "", createdAt: `${twoDaysAgo}T10:00:00Z` },
  { id: "bk-002", resourceType: "desk", resourceId: "desk-3", userId: "u-002", date: today, startTime: "09:00", endTime: "13:00", status: "checked-in", isRecurring: false, notes: "Near window please", createdAt: `${yesterday}T08:00:00Z` },
  { id: "bk-003", resourceType: "room", resourceId: "room-1", userId: "u-001", date: today, startTime: "14:00", endTime: "15:00", status: "upcoming", isRecurring: false, notes: "Sprint planning", createdAt: `${yesterday}T09:00:00Z` },
  { id: "bk-004", resourceType: "desk", resourceId: "desk-7", userId: "u-003", date: today, startTime: "10:00", endTime: "16:00", status: "upcoming", isRecurring: true, recurringGroupId: "rec-001", notes: "", createdAt: `${twoDaysAgo}T14:00:00Z` },
  { id: "bk-005", resourceType: "desk", resourceId: "desk-12", userId: "u-004", date: today, startTime: "09:00", endTime: "17:00", status: "checked-in", isRecurring: false, notes: "", createdAt: `${yesterday}T11:00:00Z` },
  { id: "bk-006", resourceType: "room", resourceId: "room-4", userId: "u-006", date: today, startTime: "10:00", endTime: "11:00", status: "upcoming", isRecurring: false, notes: "Product sync", createdAt: `${yesterday}T15:00:00Z` },
  { id: "bk-007", resourceType: "desk", resourceId: "desk-5", userId: "u-005", date: tomorrow, startTime: "09:00", endTime: "17:00", status: "upcoming", isRecurring: false, notes: "", createdAt: `${today}T07:00:00Z` },
  { id: "bk-008", resourceType: "desk", resourceId: "desk-20", userId: "u-007", date: tomorrow, startTime: "09:00", endTime: "13:00", status: "upcoming", isRecurring: true, recurringGroupId: "rec-002", notes: "", createdAt: `${yesterday}T16:00:00Z` },
  { id: "bk-009", resourceType: "room", resourceId: "room-5", userId: "u-001", date: tomorrow, startTime: "15:00", endTime: "16:30", status: "upcoming", isRecurring: false, notes: "All-hands meeting", createdAt: `${today}T08:00:00Z` },
  { id: "bk-010", resourceType: "desk", resourceId: "desk-2", userId: "u-001", date: yesterday, startTime: "09:00", endTime: "17:00", status: "completed", isRecurring: false, notes: "", createdAt: `${twoDaysAgo}T09:00:00Z` },
  { id: "bk-011", resourceType: "desk", resourceId: "desk-15", userId: "u-008", date: yesterday, startTime: "10:00", endTime: "14:00", status: "completed", isRecurring: false, notes: "", createdAt: `${twoDaysAgo}T12:00:00Z` },
  { id: "bk-012", resourceType: "room", resourceId: "room-2", userId: "u-002", date: twoDaysAgo, startTime: "09:00", endTime: "10:00", status: "completed", isRecurring: false, notes: "Code review", createdAt: `${twoDaysAgo}T07:00:00Z` },
  { id: "bk-013", resourceType: "parking", resourceId: "parking-1", userId: "u-001", date: today, startTime: "08:00", endTime: "18:00", status: "upcoming", isRecurring: false, notes: "", createdAt: `${yesterday}T20:00:00Z` },
  { id: "bk-014", resourceType: "locker", resourceId: "locker-3", userId: "u-004", date: today, startTime: "09:00", endTime: "17:00", status: "checked-in", isRecurring: false, notes: "", createdAt: `${yesterday}T21:00:00Z` },
  { id: "bk-015", resourceType: "desk", resourceId: "desk-10", userId: "u-006", date: nextWeek, startTime: "09:00", endTime: "17:00", status: "upcoming", isRecurring: false, notes: "Offsite prep", createdAt: `${today}T06:00:00Z` },
  { id: "bk-016", resourceType: "desk", resourceId: "desk-25", userId: "u-admin-001", date: today, startTime: "09:00", endTime: "17:00", status: "upcoming", isRecurring: false, notes: "Admin on-site", createdAt: `${yesterday}T10:00:00Z` },
  { id: "bk-017", resourceType: "room", resourceId: "room-3", userId: "u-admin-001", date: today, startTime: "11:00", endTime: "12:00", status: "upcoming", isRecurring: false, notes: "Leadership sync", createdAt: `${yesterday}T14:00:00Z` },
  { id: "bk-018", resourceType: "desk", resourceId: "desk-26", userId: "u-admin-001", date: tomorrow, startTime: "09:00", endTime: "17:00", status: "upcoming", isRecurring: true, recurringGroupId: "rec-003", notes: "", createdAt: `${today}T07:00:00Z` },
];

// ── Notifications ───────────────────────────
export const initialNotifications: Notification[] = [
  { id: "notif-1", type: "booking_confirmed", title: "Booking confirmed", message: "Your desk D-01 is booked for today.", read: false, createdAt: `${today}T08:30:00Z`, bookingId: "bk-001" },
  { id: "notif-2", type: "checkin_reminder", title: "Check-in reminder", message: "Don't forget to check in to desk D-03 by 9:15 AM.", read: false, createdAt: `${today}T09:00:00Z`, bookingId: "bk-002" },
  { id: "notif-3", type: "booking_confirmed", title: "Booking confirmed", message: "Room Maple reserved for 2:00–3:00 PM today.", read: true, createdAt: `${yesterday}T09:05:00Z`, bookingId: "bk-003" },
  { id: "notif-4", type: "auto_release", title: "Booking auto-released", message: "Desk D-18 was released because no one checked in.", read: true, createdAt: `${twoDaysAgo}T09:20:00Z` },
  { id: "notif-5", type: "general", title: "Welcome to DeskFlow", message: "Start by booking your first desk or meeting room.", read: true, createdAt: `${twoDaysAgo}T08:00:00Z` },
];

// ── Waitlist ────────────────────────────────
export const initialWaitlist: WaitlistEntry[] = [
  { id: "wl-001", resourceId: "desk-1", resourceType: "desk", userId: "u-005", date: today, startTime: "09:00", endTime: "17:00", position: 1, createdAt: `${today}T08:00:00Z` },
  { id: "wl-002", resourceId: "desk-3", resourceType: "desk", userId: "u-007", date: today, startTime: "09:00", endTime: "13:00", position: 1, createdAt: `${today}T08:15:00Z` },
  { id: "wl-003", resourceId: "desk-1", resourceType: "desk", userId: "u-008", date: today, startTime: "09:00", endTime: "17:00", position: 2, createdAt: `${today}T08:30:00Z` },
];

// ── Canvas objects (freeform floor plan) ─────
export const initialCanvasObjects: CanvasObject[] = [
  // Floor 1 — L-shaped office walls
  { id: "co-w1", type: "wall", floorId: "floor-1", x: 40, y: 40, width: 1520, height: 12, rotation: 0 },
  { id: "co-w2", type: "wall", floorId: "floor-1", x: 40, y: 40, width: 12, height: 920, rotation: 0 },
  { id: "co-w3", type: "wall", floorId: "floor-1", x: 40, y: 948, width: 1020, height: 12, rotation: 0 },
  { id: "co-w4", type: "wall", floorId: "floor-1", x: 1048, y: 600, width: 12, height: 360, rotation: 0 },
  { id: "co-w5", type: "wall", floorId: "floor-1", x: 1048, y: 600, width: 512, height: 12, rotation: 0 },
  { id: "co-w6", type: "wall", floorId: "floor-1", x: 1548, y: 40, width: 12, height: 572, rotation: 0 },

  // Floor 1 — interior walls
  { id: "co-w7", type: "wall", floorId: "floor-1", x: 700, y: 40, width: 12, height: 320, rotation: 0 },
  { id: "co-w8", type: "wall", floorId: "floor-1", x: 700, y: 440, width: 12, height: 520, rotation: 0 },

  // Floor 1 — desks cluster left (Open workspace)
  { id: "co-d1", type: "desk", floorId: "floor-1", x: 100, y: 100, width: 80, height: 60, rotation: 0, zoneId: "zone-1a", label: "D-01", resourceId: "desk-1" },
  { id: "co-d2", type: "desk", floorId: "floor-1", x: 200, y: 100, width: 80, height: 60, rotation: 0, zoneId: "zone-1a", label: "D-02", resourceId: "desk-2" },
  { id: "co-d3", type: "desk", floorId: "floor-1", x: 300, y: 100, width: 80, height: 60, rotation: 0, zoneId: "zone-1a", label: "D-03", resourceId: "desk-3" },
  { id: "co-d4", type: "desk", floorId: "floor-1", x: 100, y: 200, width: 80, height: 60, rotation: 0, zoneId: "zone-1a", label: "D-04", resourceId: "desk-4" },
  { id: "co-d5", type: "desk", floorId: "floor-1", x: 200, y: 200, width: 80, height: 60, rotation: 0, zoneId: "zone-1a", label: "D-05", resourceId: "desk-5" },

  // Floor 1 — desks cluster left bottom (Quiet zone)
  { id: "co-d6", type: "desk", floorId: "floor-1", x: 100, y: 500, width: 80, height: 60, rotation: 0, zoneId: "zone-1b", label: "D-06", resourceId: "desk-6" },
  { id: "co-d7", type: "desk", floorId: "floor-1", x: 200, y: 500, width: 80, height: 60, rotation: 0, zoneId: "zone-1b", label: "D-07", resourceId: "desk-7" },
  { id: "co-d8", type: "desk", floorId: "floor-1", x: 300, y: 500, width: 80, height: 60, rotation: 0, zoneId: "zone-1b", label: "D-08", resourceId: "desk-8" },
  { id: "co-d9", type: "desk", floorId: "floor-1", x: 100, y: 600, width: 80, height: 60, rotation: 0, zoneId: "zone-1b", label: "D-09", resourceId: "desk-9" },
  { id: "co-d10", type: "desk", floorId: "floor-1", x: 200, y: 600, width: 80, height: 60, rotation: 0, zoneId: "zone-1b", label: "D-10", resourceId: "desk-10" },

  // Floor 1 — rooms
  { id: "co-r1", type: "room", floorId: "floor-1", x: 800, y: 80, width: 260, height: 200, rotation: 0, label: "Maple", resourceId: "room-1", capacity: 4, amenities: ["Whiteboard", "TV"] },
  { id: "co-r2", type: "room", floorId: "floor-1", x: 1100, y: 80, width: 340, height: 240, rotation: 0, label: "Oak", resourceId: "room-2", capacity: 8, amenities: ["Whiteboard", "Video conferencing"] },

  // Floor 1 — amenities
  { id: "co-k1", type: "kitchen", floorId: "floor-1", x: 800, y: 700, width: 180, height: 160, rotation: 0, label: "Kitchen" },
  { id: "co-b1", type: "bathroom", floorId: "floor-1", x: 400, y: 800, width: 120, height: 100, rotation: 0, label: "Restroom" },
  { id: "co-e1", type: "elevator", floorId: "floor-1", x: 560, y: 800, width: 80, height: 80, rotation: 0, label: "Elevator" },

  // Floor 1 — furniture
  { id: "co-f1", type: "sofa", floorId: "floor-1", x: 450, y: 300, width: 160, height: 60, rotation: 0, label: "Lounge" },
  { id: "co-f2", type: "plant", floorId: "floor-1", x: 640, y: 100, width: 40, height: 40, rotation: 0 },
  { id: "co-f3", type: "plant", floorId: "floor-1", x: 640, y: 500, width: 40, height: 40, rotation: 0 },
  { id: "co-f4", type: "table", floorId: "floor-1", x: 450, y: 400, width: 160, height: 80, rotation: 0, label: "Communal table" },
];
