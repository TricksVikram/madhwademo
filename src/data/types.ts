// ──────────────────────────────────────────────
// DeskFlow entity types
// ──────────────────────────────────────────────

export interface Floor {
  id: string;
  name: string;
  level: number;
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface Zone {
  id: string;
  name: string;
  floorId: string;
  color: string;
  teamId?: string;
}

export type ResourceStatus = "available" | "booked" | "occupied" | "maintenance";

export interface Desk {
  id: string;
  label: string;
  zoneId: string;
  floorId: string;
  amenities: string[];
  status: ResourceStatus;
  gridPosition?: GridPosition;
  assignedUserId?: string;
}

export interface FloorLayout {
  floorId: string;
  gridWidth: number;
  gridHeight: number;
  canvasWidth: number;
  canvasHeight: number;
}

// ── Freeform canvas object types ─────────────
export type CanvasObjectType =
  | "desk" | "room" | "wall"
  | "kitchen" | "bathroom" | "elevator" | "stairs"
  | "table" | "chair" | "sofa" | "plant";

export interface CanvasObject {
  id: string;
  type: CanvasObjectType;
  floorId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zoneId?: string;
  label?: string;
  resourceId?: string;
  capacity?: number;
  amenities?: string[];
  wallThickness?: number;
}

export interface Room {
  id: string;
  name: string;
  floorId: string;
  capacity: number;
  amenities: string[];
  status: ResourceStatus;
  gridPosition?: GridPosition;
  gridSize?: { w: number; h: number };
}

export interface ParkingSpot {
  id: string;
  label: string;
  location: string;
  status: ResourceStatus;
}

export interface Locker {
  id: string;
  label: string;
  size: "small" | "medium" | "large";
  location: string;
  status: ResourceStatus;
}

export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  teamId: string;
}

export type ResourceType = "desk" | "room" | "parking" | "locker";

export type BookingStatus =
  | "upcoming"
  | "checked-in"
  | "completed"
  | "cancelled"
  | "auto-released";

export interface GuestInfo {
  name: string;
  email: string;
  company?: string;
}

export interface Booking {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: BookingStatus;
  isRecurring: boolean;
  recurringGroupId?: string;
  buddyGroupId?: string;
  guestInfo?: GuestInfo;
  notes: string;
  createdAt: string; // ISO datetime
}

export type NotificationType =
  | "booking_confirmed"
  | "checkin_reminder"
  | "waitlist_bump"
  | "auto_release"
  | "general";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO datetime
  bookingId?: string;
}

export interface WaitlistEntry {
  id: string;
  resourceId: string;
  resourceType: ResourceType;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  position: number;
  createdAt: string;
}
