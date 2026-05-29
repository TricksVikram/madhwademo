import { useMemo } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isToday,
} from "date-fns";
import { BookingBlock } from "./BookingBlock";
import type { Booking } from "../../../data/types";

const START_HOUR = 8;
const END_HOUR = 20;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i
);
const SLOT_HEIGHT = 56;

interface WeekViewProps {
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
  return ((eh * 60 + em - (sh * 60 + sm)) / 60) * SLOT_HEIGHT;
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

function layoutOverlapping(bookings: Booking[]): LayoutedBooking[] {
  if (bookings.length === 0) return [];
  const sorted = [...bookings].sort((a, b) => {
    const diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    if (diff !== 0) return diff;
    return timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
  });
  const clusters: Booking[][] = [];
  let cluster: Booking[] = [sorted[0]];
  let clusterEnd = timeToMinutes(sorted[0].endTime);
  for (let i = 1; i < sorted.length; i++) {
    const start = timeToMinutes(sorted[i].startTime);
    if (start < clusterEnd) {
      cluster.push(sorted[i]);
      clusterEnd = Math.max(clusterEnd, timeToMinutes(sorted[i].endTime));
    } else {
      clusters.push(cluster);
      cluster = [sorted[i]];
      clusterEnd = timeToMinutes(sorted[i].endTime);
    }
  }
  clusters.push(cluster);
  const result: LayoutedBooking[] = [];
  for (const c of clusters) {
    const cols: number[] = new Array(c.length).fill(-1);
    const colEnds: number[] = [];
    for (let i = 0; i < c.length; i++) {
      const s = timeToMinutes(c[i].startTime);
      let col = colEnds.findIndex((e) => e <= s);
      if (col === -1) { col = colEnds.length; colEnds.push(0); }
      cols[i] = col;
      colEnds[col] = timeToMinutes(c[i].endTime);
    }
    const total = colEnds.length;
    for (let i = 0; i < c.length; i++) {
      result.push({ booking: c[i], column: cols[i], totalColumns: total });
    }
  }
  return result;
}

export function WeekView({ date, bookings, onEmptySlotClick }: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      map.set(
        key,
        bookings.filter((b) => b.date === key)
      );
    }
    return map;
  }, [bookings, days]);

  const handleSlotClick = (day: Date, hour: number) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    onEmptySlotClick(dateStr, startTime);
  };

  // Current time indicator
  const now = new Date();
  const todayIndex = days.findIndex((d) => isToday(d));
  const showTimeLine = todayIndex >= 0;
  const currentTimeOffset = showTimeLine
    ? (now.getHours() - START_HOUR) * SLOT_HEIGHT +
      (now.getMinutes() / 60) * SLOT_HEIGHT
    : 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <div className="min-w-[700px]">
        {/* Day headers */}
        <div className="flex border-b border-border">
          <div className="w-14 shrink-0" />
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayBookings = bookingsByDay.get(dateStr) ?? [];
            return (
              <div
                key={day.toISOString()}
                className={`flex-1 border-l border-border px-1 py-2 text-center ${
                  isToday(day) ? "bg-primary/5" : ""
                }`}
              >
                <div className="text-xs text-muted-foreground">
                  {format(day, "EEE")}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    isToday(day) ? "text-primary" : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </div>
                {dayBookings.length > 0 && (
                  <div className="mx-auto mt-0.5 h-1 w-1 rounded-full bg-primary/50" />
                )}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="flex border-b border-border last:border-b-0"
              style={{ height: SLOT_HEIGHT }}
            >
              <div className="flex w-14 shrink-0 items-start justify-end pr-2 pt-0.5">
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(2000, 0, 1, hour), "h a")}
                </span>
              </div>
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`relative flex-1 cursor-pointer border-l border-border transition-colors hover:bg-accent/30 ${
                    isToday(day) ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleSlotClick(day, hour)}
                >
                  {/* Half-hour dashed line */}
                  <div
                    className="absolute right-0 left-0 border-t border-dashed border-border/50"
                    style={{ top: SLOT_HEIGHT / 2 }}
                  />
                </div>
              ))}
            </div>
          ))}

          {/* Current time indicator */}
          {showTimeLine &&
            currentTimeOffset > 0 &&
            currentTimeOffset < (END_HOUR - START_HOUR) * SLOT_HEIGHT && (
              <div
                className="pointer-events-none absolute z-20"
                style={{
                  top: currentTimeOffset,
                  left: `calc(56px + ${todayIndex} * ((100% - 56px) / 7))`,
                  width: `calc((100% - 56px) / 7)`,
                }}
              >
                <div className="relative h-0.5 bg-destructive">
                  <div className="absolute -left-1.5 -top-1 h-3 w-3 rounded-full bg-destructive" />
                </div>
              </div>
            )}

          {/* Booking blocks per day — columns prevent overlap */}
          {days.map((day, dayIndex) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayBookings = bookingsByDay.get(dateStr) ?? [];
            const layouted = layoutOverlapping(dayBookings);
            return layouted.map(({ booking, column, totalColumns }) => {
              const top = timeToOffset(booking.startTime);
              const height = timeDuration(booking.startTime, booking.endTime);
              if (top < 0 || height <= 0) return null;
              const dayLeft = `calc(56px + ${dayIndex} * ((100% - 56px) / 7))`;
              const dayWidth = `(100% - 56px) / 7`;
              const left = `calc(${dayLeft} + 2px + (${dayWidth} - 4px) * ${column} / ${totalColumns})`;
              const width = `calc((${dayWidth} - 4px) / ${totalColumns})`;
              return (
                <div
                  key={booking.id}
                  className="absolute z-10"
                  style={{
                    top,
                    height: Math.max(height - 2, 18),
                    left,
                    width,
                  }}
                >
                  <BookingBlock
                    booking={booking}
                    compact
                    className="h-full w-full"
                  />
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
