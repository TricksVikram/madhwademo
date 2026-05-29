import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import { useMockData } from "../../../contexts/MockDataContext";
import { useIsMobile } from "../../../hooks/use-mobile";
import type { Booking } from "../../../data/types";

const STATUS_DOT: Record<string, string> = {
  upcoming: "bg-primary",
  "checked-in": "bg-chart-2",
  completed: "bg-muted-foreground",
};

interface MonthViewProps {
  date: Date;
  bookings: Booking[];
  onDaySelect: (date: Date) => void;
}

export function MonthView({ date, bookings, onDaySelect }: MonthViewProps) {
  const isMobile = useIsMobile();
  const { desks, rooms } = useMockData();

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }

    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [date]);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const existing = map.get(b.date);
      if (existing) existing.push(b);
      else map.set(b.date, [b]);
    }
    return map;
  }, [bookings]);

  const getResourceLabel = (b: Booking) => {
    if (b.resourceType === "desk")
      return desks.find((d) => d.id === b.resourceId)?.label ?? b.resourceId;
    return rooms.find((r) => r.id === b.resourceId)?.name ?? b.resourceId;
  };

  const dayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {dayHeaders.map((d) => (
          <div
            key={d}
            className="px-1 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
          {week.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayBookings = bookingsByDate.get(dateStr) ?? [];
            const inMonth = isSameMonth(day, date);
            const today = isToday(day);
            const maxShow = isMobile ? 0 : 3;
            const overflow = dayBookings.length - maxShow;

            return (
              <div
                key={dateStr}
                className={`min-h-[72px] cursor-pointer border-l border-border p-1 first:border-l-0 transition-colors hover:bg-accent/30 ${
                  !inMonth ? "bg-muted/30" : ""
                } ${today ? "ring-1 ring-inset ring-primary/40" : ""}`}
                onClick={() => onDaySelect(day)}
              >
                <span
                  className={`inline-block text-xs font-medium ${
                    today
                      ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : inMonth
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>

                {isMobile ? (
                  dayBookings.length > 0 && (
                    <div className="mt-1 flex gap-0.5">
                      {dayBookings.slice(0, 3).map((b) => (
                        <div
                          key={b.id}
                          className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[b.status] ?? "bg-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="mt-0.5 space-y-0.5">
                    {dayBookings.slice(0, maxShow).map((b) => (
                      <div
                        key={b.id}
                        className={`flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight ${
                          b.status === "upcoming"
                            ? "bg-primary/10 text-primary"
                            : b.status === "checked-in"
                              ? "bg-chart-2/10 text-chart-2"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className="truncate">{getResourceLabel(b)}</span>
                      </div>
                    ))}
                    {overflow > 0 && (
                      <span className="px-1 text-[10px] text-muted-foreground">
                        +{overflow} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
