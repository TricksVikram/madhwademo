// Architectural top-down SVG path data and render helpers for the office builder canvas.
// All paths are designed for a normalized coordinate space and scaled via Konva scaleX/scaleY.

import type { CanvasObjectType } from "../../../../data/types";

export interface FloorplanStyle {
  fill: string;
  stroke: string;
  cornerRadius: number;
  shadowColor: string;
}

// ── Style configs per object type ────────────────────────────

export function getObjectStyle(type: CanvasObjectType, zoneColor?: string): FloorplanStyle {
  switch (type) {
    case "wall":
      return { fill: "#334155", stroke: "#1e293b", cornerRadius: 1, shadowColor: "transparent" };
    case "desk":
      return {
        fill: zoneColor ? `${zoneColor}20` : "#e0f2fe20",
        stroke: zoneColor ?? "#94a3b8",
        cornerRadius: 4,
        shadowColor: zoneColor ?? "transparent",
      };
    case "room":
      return { fill: "#ede9fe", stroke: "#8b5cf6", cornerRadius: 12, shadowColor: "#8b5cf6" };
    case "kitchen":
      return { fill: "#fef9c3", stroke: "#eab308", cornerRadius: 8, shadowColor: "#eab308" };
    case "bathroom":
      return { fill: "#e0f2fe", stroke: "#0ea5e9", cornerRadius: 8, shadowColor: "#0ea5e9" };
    case "elevator":
    case "stairs":
      return { fill: "#f1f5f9", stroke: "#94a3b8", cornerRadius: 4, shadowColor: "transparent" };
    case "sofa":
      return { fill: "#fce7f3", stroke: "#ec4899", cornerRadius: 10, shadowColor: "#ec4899" };
    case "chair":
      return { fill: "#fce7f3", stroke: "#ec4899", cornerRadius: 20, shadowColor: "#ec4899" };
    case "table":
      return { fill: "#f0fdf4", stroke: "#22c55e", cornerRadius: 6, shadowColor: "#22c55e" };
    case "plant":
      return { fill: "#dcfce7", stroke: "#4ade80", cornerRadius: 20, shadowColor: "#4ade80" };
    default:
      return { fill: "#f8fafc", stroke: "#e2e8f0", cornerRadius: 4, shadowColor: "transparent" };
  }
}

// ── Desk: L-shaped surface path (normalized 0-100) ───────────

/** T-shaped desk outline for a 100×100 unit square */
export const DESK_PATH = "M 0 0 L 100 0 L 100 35 L 70 35 L 70 65 L 30 65 L 30 35 L 0 35 Z";

/** Monitor bar (thin rectangle at top of desk) */
export const DESK_MONITOR_PATH = "M 15 8 L 85 8 L 85 16 L 15 16 Z";

/** Keyboard tray line */
export const DESK_KEYBOARD_PATH = "M 25 35 L 75 35";

// ── Chair: circle seat + backrest arc ────────────────────────

/** Backrest arc path for a 100×100 unit (semi-circle at top) */
export const CHAIR_BACKREST_PATH =
  "M 15 45 Q 15 10 50 10 Q 85 10 85 45";

// ── Sofa: U-shape with arm rests ─────────────────────────────

/** U-shaped sofa outline for a 100×100 unit */
export const SOFA_PATH =
  "M 0 0 L 100 0 L 100 100 L 85 100 L 85 25 L 15 25 L 15 100 L 0 100 Z";

/** Cushion divider lines (as paths) — two thirds */
export const SOFA_CUSHION_1 = "M 33 25 L 33 100";
export const SOFA_CUSHION_2 = "M 66 25 L 66 100";

// ── Kitchen: countertop + sink + burner layout ───────────────

/** Countertop divider line */
export const KITCHEN_COUNTER_PATH = "M 0 35 L 100 35";

/** Sink circle center and radius (in 100×100 space) */
export const KITCHEN_SINK = { cx: 30, cy: 65, r: 12 };

/** Stove burner positions */
export const KITCHEN_BURNERS = [
  { cx: 65, cy: 55, r: 8 },
  { cx: 85, cy: 55, r: 8 },
  { cx: 65, cy: 75, r: 8 },
  { cx: 85, cy: 75, r: 8 },
];

// ── Bathroom: toilet + sink ──────────────────────────────────

/** Toilet bowl outline (architectural top-down) — elongated oval */
export const TOILET_PATH =
  "M 35 30 Q 35 15 50 15 Q 65 15 65 30 L 65 65 Q 65 85 50 85 Q 35 85 35 65 Z";

/** Toilet tank (rectangle at top) */
export const TOILET_TANK_PATH = "M 38 10 L 62 10 L 62 20 L 38 20 Z";

/** Bathroom sink — small circle */
export const BATHROOM_SINK = { cx: 20, cy: 50, r: 10 };

// ── Elevator: diagonal cross ─────────────────────────────────

export const ELEVATOR_CROSS_1 = "M 10 10 L 90 90";
export const ELEVATOR_CROSS_2 = "M 90 10 L 10 90";

// ── Stairs: tread lines + direction arrow ────────────────────

export function getStairTreadLines(numTreads: number = 6): string[] {
  const lines: string[] = [];
  for (let i = 1; i <= numTreads; i++) {
    const y = (i / (numTreads + 1)) * 100;
    lines.push(`M 5 ${y} L 95 ${y}`);
  }
  return lines;
}

/** Direction arrow pointing up */
export const STAIRS_ARROW_PATH = "M 50 20 L 40 35 L 45 35 L 45 80 L 55 80 L 55 35 L 60 35 Z";

// ── Plant: leaf petals radiating from center ─────────────────

/** Generate leaf petal paths around center (50,50) */
export function getLeafPetals(count: number = 6): string[] {
  const petals: string[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const tipX = 50 + Math.cos(angle) * 38;
    const tipY = 50 + Math.sin(angle) * 38;
    const cp1Angle = angle - 0.3;
    const cp2Angle = angle + 0.3;
    const cp1X = 50 + Math.cos(cp1Angle) * 22;
    const cp1Y = 50 + Math.sin(cp1Angle) * 22;
    const cp2X = 50 + Math.cos(cp2Angle) * 22;
    const cp2Y = 50 + Math.sin(cp2Angle) * 22;
    petals.push(
      `M 50 50 Q ${cp1X} ${cp1Y} ${tipX} ${tipY} Q ${cp2X} ${cp2Y} 50 50 Z`
    );
  }
  return petals;
}

// ── Table: meeting table outline ─────────────────────────────

/** Rounded rectangle table (for rectangular tables) */
export const TABLE_RECT_PATH =
  "M 10 0 L 90 0 Q 100 0 100 10 L 100 90 Q 100 100 90 100 L 10 100 Q 0 100 0 90 L 0 10 Q 0 0 10 0 Z";

/** Center cross marking for meeting tables */
export const TABLE_CENTER_CROSS_1 = "M 45 30 L 45 70";
export const TABLE_CENTER_CROSS_2 = "M 30 50 L 70 50";
