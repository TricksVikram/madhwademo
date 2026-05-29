import { useMemo } from "react";
import { format, isToday } from "date-fns";
import { BookingBlock } from "./BookingBlock";
import type { Booking } from "../../../data/types";

const START_HOUR = 8;
const END_HOUR = 20;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const SLOT_HEIGHT = 60;

interface DayViewProps {
  date: Date;
  bookings: Booking[];
  onEmptySlotClick: (date: string, startTime: string) => void;
}

function timeToOffset(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h - START_HOUR) * SLOT_HEIGHT + (m / 60) * SLOT_HEIGHT;
}

function timeDuration(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60 * SLOT_HEIGHT;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

interface LayoutedBooking {
  booking: Booking;
  column: number;
  totalColumns: number;
}

function layoutOverlappingBookings(bookings: Booking[]): LayoutedBooking[] {
  if (bookings.length === 0) return [];

  // Sort by start time, then by duration (longer first)
  const sorted = [...bookings].sort((a, b) => {
    const diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    if (diff !== 0) return diff;
    return timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
  });

  // Group into overlap clusters
  const clusters: Booking[][] = [];
  let currentCluster: Booking[] = [sorted[0]];
  let clusterEnd = timeToMinutes(sorted[0].endTime);

  for (let i = 1; i < sorted.length; i++) {
    const start = timeToMinutes(sorted[i].startTime);
    if (start < clusterEnd) {
      // Overlaps with current cluster
      currentCluster.push(sorted[i]);
      clusterEnd = Math.max(clusterEnd, timeToMinutes(sorted[i].endTime));
    } else {
      clusters.push(currentCluster);
      currentCluster = [sorted[i]];
      clusterEnd = timeToMinutes(sorted[i].endTime);
    }
  }
  clusters.push(currentCluster);

  // Assign columns within each cluster
  const result: LayoutedBooking[] = [];
  for (const cluster of clusters) {
    const columns: number[] = new Array(cluster.length).fill(-1);
    const columnEnds: number[] = []; // tracks when each column is free

    for (let i = 0; i < cluster.length; i++) {
      const start = timeToMinutes(cluster[i].startTime);
      // Find first column where this booking fits
      let col = -1;
      for (let c = 0; c < columnEnds.length; c++) {
        if (columnEnds[c] <= start) {
          col = c;
          break;
        }
      }
      if (col === -1) {
        col = columnEnds.length;
        columnEnds.push(0);
      }
      columns[i] = col;
      columnEnds[col] = timeToMinutes(cluster[i].endTime);
    }

    const totalColumns = columnEnds.length;
    for (let i = 0; i < cluster.length; i++) {
      result.push({
        booking: cluster[i],
        column: columns[i],
        totalColumns,
      });
    }
  }

  return result;
}

export function DayView({ date, bookings, onEmptySlotClick }: DayViewProps) {
  const dateStr = format(date, "yyyy-MM-dd");
  const dayBookings = useMemo(
    () => bookings.filter((b) => b.date === dateStr),
    [bookings, dateStr]
  );

  const layouted = useMemo(
    () => layoutOverlappingBookings(dayBookings),
    [dayBookings]
  );

  const now = new Date();
  const showTimeLine = isToday(date);
  const currentTimeOffset = showTimeLine
    ? (now.getHours() - START_HOUR) * SLOT_HEIGHT +
      (now.getMinutes() / 60) * SLOT_HEIGHT
    : 0;

  const handleSlotClick = (hour: number) => {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    onEmptySlotClick(dateStr, startTime);
  };

  return (
    <div className="overflow-auto rounded-lg border border-border bg-card">
      <div className="relative min-w-[320px]">
        {/* Time grid */}
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="flex border-b border-border last:border-b-0"
            style={{ height: SLOT_HEIGHT }}
          >
            <div className="flex w-16 shrink-0 items-start justify-end pr-3 pt-1">
              <span className="text-xs text-muted-foreground">
                {format(new Date(2000, 0, 1, hour), "h a")}
              </span>
            </div>
            <div
              className="relative flex-1 cursor-pointer transition-colors hover:bg-accent/30"
              onClick={() => handleSlotClick(hour)}
            >
              {/* Half-hour dashed line */}
              <div
                className="absolute right-0 left-0 border-t border-dashed border-border/50"
                style={{ top: SLOT_HEIGHT / 2 }}
              />
            </div>
          </div>
        ))}

        {/* Current time indicator */}
        {showTimeLine &&
          currentTimeOffset > 0 &&
          currentTimeOffset < (END_HOUR - START_HOUR) * SLOT_HEIGHT && (
            <div
              className="pointer-events-none absolute right-0 left-16 z-20 h-0.5 bg-destructive"
              style={{ top: currentTimeOffset }}
            >
              <div className="absolute -left-1.5 -top-1 h-3 w-3 rounded-full bg-destructive" />
            </div>
          )}

        {/* Booking blocks — laid out in columns to avoid overlap */}
        {layouted.map(({ booking, column, totalColumns }) => {
          const top = timeToOffset(booking.startTime);
          const height = timeDuration(booking.startTime, booking.endTime);
          if (top < 0 || height <= 0) return null;

          const contentWidth = `calc(100% - 68px - 8px)`; // left-[68px] right-2
          const colWidth = `calc(${contentWidth} / ${totalColumns})`;
          const colLeft = `calc(68px + ${contentWidth} * ${column} / ${totalColumns})`;

          return (
            <div
              key={booking.id}
              className="absolute z-10 pr-0.5"
              style={{
                top,
                height: Math.max(height - 2, 16),
                left: colLeft,
                width: colWidth,
              }}
            >
              <BookingBlock
                booking={booking}
                className="h-full w-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
