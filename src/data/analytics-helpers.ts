import { format, subDays, eachDayOfInterval } from "date-fns";
import type { Booking, Floor, Desk, Team, User } from "./types";

// Seeded pseudo-random for consistent data per date range
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export type DateRange = "today" | "this_week" | "this_month" | "last_30";

export function getDateRangeDays(range: DateRange): string[] {
  const now = new Date();
  let start: Date;
  switch (range) {
    case "today": start = now; break;
    case "this_week": start = subDays(now, 6); break;
    case "this_month": start = subDays(now, 29); break;
    case "last_30": start = subDays(now, 29); break;
  }
  return eachDayOfInterval({ start, end: now }).map((d) => format(d, "yyyy-MM-dd"));
}

export interface DailyUtilization {
  date: string;
  label: string;
  utilization: number;
}

export function generateDailyUtilization(range: DateRange, deskCount: number): DailyUtilization[] {
  const days = getDateRangeDays(range);
  const rand = seededRandom(hashStr(range));
  return days.map((d) => ({
    date: d,
    label: format(new Date(d + "T12:00:00"), "MMM d"),
    utilization: Math.round(30 + rand() * 55),
  }));
}

export interface FloorOccupancy {
  floor: string;
  occupancy: number;
}

export function generateFloorOccupancy(floors: Floor[], range: DateRange): FloorOccupancy[] {
  const rand = seededRandom(hashStr("floor" + range));
  return floors.map((f) => ({
    floor: f.name,
    occupancy: Math.round(25 + rand() * 60),
  }));
}

export interface HourlyData {
  hour: string;
  occupancy: number;
}

export function generatePeakHours(range: DateRange): HourlyData[] {
  const rand = seededRandom(hashStr("peak" + range));
  const hours: HourlyData[] = [];
  for (let h = 6; h <= 20; h++) {
    const label = `${h > 12 ? h - 12 : h}${h >= 12 ? "PM" : "AM"}`;
    // Bell curve peaking around 10-11 AM and 2-3 PM
    const base = h >= 9 && h <= 16 ? 40 : 10;
    const peak = (h >= 10 && h <= 11) || (h >= 14 && h <= 15) ? 30 : 0;
    hours.push({ hour: label, occupancy: Math.round(base + peak + rand() * 20) });
  }
  return hours;
}

export interface ResourceBreakdown {
  name: string;
  value: number;
}

export function generateResourceBreakdown(range: DateRange): ResourceBreakdown[] {
  const rand = seededRandom(hashStr("res" + range));
  return [
    { name: "Desks", value: Math.round(50 + rand() * 30) },
    { name: "Rooms", value: Math.round(15 + rand() * 15) },
    { name: "Parking", value: Math.round(10 + rand() * 10) },
    { name: "Lockers", value: Math.round(5 + rand() * 10) },
  ];
}

export interface SummaryStats {
  avgUtilization: number;
  totalBookings: number;
  peakHour: string;
  popularFloor: string;
}

export function generateSummaryStats(
  range: DateRange,
  floors: Floor[]
): SummaryStats {
  const util = generateDailyUtilization(range, 30);
  const avg = Math.round(util.reduce((s, d) => s + d.utilization, 0) / util.length);
  const peak = generatePeakHours(range);
  const peakEntry = peak.reduce((a, b) => (b.occupancy > a.occupancy ? b : a));
  const floorOcc = generateFloorOccupancy(floors, range);
  const topFloor = floorOcc.reduce((a, b) => (b.occupancy > a.occupancy ? b : a));
  const rand = seededRandom(hashStr("bookings" + range));
  return {
    avgUtilization: avg,
    totalBookings: Math.round(80 + rand() * 200),
    peakHour: peakEntry.hour,
    popularFloor: topFloor.floor,
  };
}

export interface DeskHeatmapData {
  deskId: string;
  label: string;
  utilization: number;
}

export function generateDeskHeatmap(desks: Desk[], range: DateRange): DeskHeatmapData[] {
  const rand = seededRandom(hashStr("heatmap" + range));
  return desks.map((d) => ({
    deskId: d.id,
    label: d.label,
    utilization: d.status === "maintenance" ? 0 : Math.round(rand() * 100),
  }));
}

export function getHeatmapColor(utilization: number): string {
  if (utilization <= 40) return "var(--color-chart-2)";
  if (utilization <= 70) return "var(--color-chart-5)";
  if (utilization <= 90) return "var(--color-chart-1)";
  return "hsl(0 72% 51%)";
}

export interface TeamAttendanceData {
  date: string;
  label: string;
  [teamName: string]: string | number;
}

export function generateTeamAttendance(
  range: DateRange,
  teams: Team[]
): TeamAttendanceData[] {
  const days = getDateRangeDays(range);
  const rand = seededRandom(hashStr("team" + range));
  return days.map((d) => {
    const row: TeamAttendanceData = {
      date: d,
      label: format(new Date(d + "T12:00:00"), "MMM d"),
    };
    teams.forEach((t) => {
      row[t.name] = Math.round(1 + rand() * 7);
    });
    return row;
  });
}

export function generateExportCSV(
  range: DateRange,
  floors: Floor[],
  deskCount: number
): string {
  const util = generateDailyUtilization(range, deskCount);
  const stats = generateSummaryStats(range, floors);
  const rows = [
    ["Date", "Utilization %", "Bookings count", "Peak hour"].join(","),
    ...util.map(
      (u) => [u.date, u.utilization, Math.round(stats.totalBookings / util.length), stats.peakHour].join(",")
    ),
  ];
  return rows.join("\n");
}
