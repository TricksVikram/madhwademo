import { useState, useMemo, useCallback } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Building2, Home, MapPin, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useMockData } from "../../../contexts/MockDataContext";
import { Button } from "../../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { Progress } from "../../ui/progress";
import { DaySuggestions } from "./DaySuggestions";
import { BookingDialog } from "../booking/BookingDialog";
import { useBookingDialog } from "../booking/useBookingDialog";

export function PlannerPage() {
  const { currentUser } = useDemoRole();
  const { bookings, users, desks, floors } = useMockData();
  const bookingDialog = useBookingDialog();

  const [weekOffset, setWeekOffset] = useState(0);
  const [plannedDays, setPlannedDays] = useState<Set<string>>(new Set());

  const currentMockUser = users.find((u) => u.id === currentUser.id);

  const teammates = useMemo(
    () => users.filter((u) => u.id !== currentUser.id && u.teamId === currentMockUser?.teamId),
    [users, currentUser.id, currentMockUser?.teamId]
  );

  const baseMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekMonday = weekOffset === 0 ? baseMonday : addWeeks(baseMonday, weekOffset);

  const weekDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const date = addDays(weekMonday, i);
      return {
        date: format(date, "yyyy-MM-dd"),
        label: format(date, "EEEE"),
        shortLabel: format(date, "EEE"),
        dateLabel: format(date, "MMM d"),
      };
    });
  }, [weekMonday]);

  const weekRange = `${format(weekMonday, "MMM d")} – ${format(addDays(weekMonday, 4), "d, yyyy")}`;

  const toggleDay = useCallback((dateStr: string) => {
    setPlannedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  }, []);

  // Get teammate attendance per day
  const dayData = useMemo(() => {
    return weekDays.map((day) => {
      const teammatesInOffice = teammates.filter((t) =>
        bookings.some(
          (b) =>
            b.userId === t.id &&
            b.date === day.date &&
            b.resourceType === "desk" &&
            b.status !== "cancelled" &&
            b.status !== "auto-released"
        )
      );
      const overlapPct = teammates.length > 0
        ? Math.round((teammatesInOffice.length / teammates.length) * 100)
        : 0;

      // Check if current user has a booking
      const userBooking = bookings.find(
        (b) =>
          b.userId === currentUser.id &&
          b.date === day.date &&
          b.resourceType === "desk" &&
          b.status !== "cancelled" &&
          b.status !== "auto-released" &&
          b.status !== "completed"
      );

      const bookedDesk = userBooking
        ? desks.find((d) => d.id === userBooking.resourceId)
        : undefined;
      const bookedFloor = bookedDesk
        ? floors.find((f) => f.id === bookedDesk.floorId)
        : undefined;

      return {
        ...day,
        teammatesInOffice,
        overlapPct,
        userBooking,
        bookedDesk,
        bookedFloor,
      };
    });
  }, [weekDays, teammates, bookings, currentUser.id, desks, floors]);

  return (
    <div className="mx-auto max-w-4xl space-y-6" data-testid="page-planner">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">My week</h1>
        <p className="text-sm text-muted-foreground">
          Plan your week and coordinate with your team
        </p>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">{weekRange}</span>
        </div>
        {weekOffset !== 0 && (
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
            This week
          </Button>
        )}
      </div>

      {/* Day suggestions */}
      <DaySuggestions weekDays={weekDays} plannedDays={plannedDays} />

      {/* Day cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {dayData.map((day) => {
          const isPlanned = plannedDays.has(day.date);
          return (
            <div
              key={day.date}
              className={`flex flex-col rounded-lg border p-4 transition-colors cursor-pointer ${
                isPlanned
                  ? "bg-primary/5 border-primary/30"
                  : "bg-muted/30 border-border hover:bg-muted/50"
              }`}
              onClick={() => toggleDay(day.date)}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{day.shortLabel}</p>
                  <p className="text-xs text-muted-foreground">{day.dateLabel}</p>
                </div>
                {isPlanned ? (
                  <Building2 className="h-5 w-5 text-primary" />
                ) : (
                  <Home className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>

              {/* Status label */}
              <p className={`text-xs font-medium mb-3 ${isPlanned ? "text-primary" : "text-muted-foreground"}`}>
                {isPlanned ? "In office" : "Remote"}
              </p>

              {/* Team overlap */}
              <div className="space-y-2 mt-auto">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{day.teammatesInOffice.length} teammate{day.teammatesInOffice.length !== 1 ? "s" : ""}</span>
                  <span>{day.overlapPct}%</span>
                </div>
                <Progress value={day.overlapPct} className="h-1.5" />

                {/* Avatar stack */}
                {day.teammatesInOffice.length > 0 && (
                  <div className="flex -space-x-1.5">
                    {day.teammatesInOffice.slice(0, 4).map((t) => (
                      <Avatar key={t.id} className="h-5 w-5 ring-1 ring-background">
                        <AvatarImage src={t.avatar} alt={t.name} />
                        <AvatarFallback className="text-[7px]">
                          {t.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {day.teammatesInOffice.length > 4 && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-medium ring-1 ring-background">
                        +{day.teammatesInOffice.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick book / existing booking */}
              {isPlanned && (
                <div className="mt-3 pt-3 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                  {day.userBooking ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium">{day.bookedDesk?.label}</span>
                        <span className="text-muted-foreground">· {day.bookedFloor?.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {day.userBooking.startTime} – {day.userBooking.endTime}
                      </div>
                      <Link
                        to="/app/bookings"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View booking
                      </Link>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-7"
                      onClick={() =>
                        bookingDialog.open({ date: day.date, resourceType: "desk" })
                      }
                    >
                      Book a desk
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BookingDialog
        isOpen={bookingDialog.isOpen}
        onClose={bookingDialog.close}
        prefill={bookingDialog.prefill}
      />
    </div>
  );
}
