import { useState, useMemo, useCallback } from "react";
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMockData } from "../../../contexts/MockDataContext";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { useIsMobile } from "../../../hooks/use-mobile";
import { CalendarSkeleton } from "../skeletons/CalendarSkeleton";
import { Button } from "../../ui/button";
import { CalendarFilters } from "./CalendarFilters";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { BookingDialog } from "../booking/BookingDialog";
import { useBookingDialog } from "../booking/useBookingDialog";
import type { Booking } from "../../../data/types";

export type CalendarViewMode = "day" | "week" | "month";

export interface CalendarFiltersState {
  floorId: string | null;
  zoneId: string | null;
  resourceType: "all" | "desk" | "room";
}

export interface BookingIntent {
  date: string;
  startTime: string;
  resourceType: "desk" | "room";
}

const VIEW_LABELS: { value: CalendarViewMode; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export function CalendarPage() {
  const isMobile = useIsMobile();
  const [view, setView] = useState<CalendarViewMode>(isMobile ? "day" : "day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState<CalendarFiltersState>({
    floorId: null,
    zoneId: null,
    resourceType: "all",
  });

  const { bookings, desks, rooms, zones } = useMockData();

  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    if (view === "day") setCurrentDate((d) => subDays(d, 1));
    else if (view === "week") setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subMonths(d, 1));
  };
  const goNext = () => {
    if (view === "day") setCurrentDate((d) => addDays(d, 1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addMonths(d, 1));
  };

  const dateLabel = useMemo(() => {
    if (view === "day") return format(currentDate, "EEEE, MMMM d, yyyy");
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    return format(currentDate, "MMMM yyyy");
  }, [view, currentDate]);

  const filteredBookings = useMemo(() => {
    let result = bookings.filter(
      (b) =>
        b.status !== "cancelled" &&
        b.status !== "auto-released" &&
        (b.resourceType === "desk" || b.resourceType === "room")
    );

    if (filters.resourceType !== "all") {
      result = result.filter((b) => b.resourceType === filters.resourceType);
    }

    if (filters.floorId) {
      const floorResourceIds = new Set([
        ...desks.filter((d) => d.floorId === filters.floorId).map((d) => d.id),
        ...rooms.filter((r) => r.floorId === filters.floorId).map((r) => r.id),
      ]);
      result = result.filter((b) => floorResourceIds.has(b.resourceId));
    }

    if (filters.zoneId) {
      const zoneResourceIds = new Set(
        desks.filter((d) => d.zoneId === filters.zoneId).map((d) => d.id)
      );
      result = result.filter(
        (b) => b.resourceType === "room" || zoneResourceIds.has(b.resourceId)
      );
    }

    return result;
  }, [bookings, filters, desks, rooms]);

  const bookingDialog = useBookingDialog();

  const handleEmptySlotClick = useCallback(
    (date: string, startTime: string) => {
      bookingDialog.open({ date, startTime });
    },
    [bookingDialog]
  );

  const handleDaySelect = useCallback((date: Date) => {
    setCurrentDate(date);
    setView("day");
  }, []);

  const isLoading = useSimulatedLoading(400, [view, currentDate.toDateString()]);

  if (isLoading) return <CalendarSkeleton />;

  return (
    <div className="mx-auto max-w-6xl space-y-4" data-testid="page-calendar">
      {/* Header row: title + nav + view toggle + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
            {VIEW_LABELS.map((v) => (
              <button
                key={v.value}
                onClick={() => setView(v.value)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  view === v.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="min-w-0 text-sm font-semibold text-foreground">
            {dateLabel}
          </span>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-end">
        <CalendarFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Calendar views */}
      {view === "day" && (
        <DayView
          date={currentDate}
          bookings={filteredBookings}
          onEmptySlotClick={handleEmptySlotClick}
        />
      )}
      {view === "week" && (
        <WeekView
          date={currentDate}
          bookings={filteredBookings}
          onEmptySlotClick={handleEmptySlotClick}
        />
      )}
      {view === "month" && (
        <MonthView
          date={currentDate}
          bookings={filteredBookings}
          onDaySelect={handleDaySelect}
        />
      )}

      <BookingDialog
        isOpen={bookingDialog.isOpen}
        onClose={bookingDialog.close}
        prefill={bookingDialog.prefill}
      />
    </div>
  );
}
