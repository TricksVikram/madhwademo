import { format } from "date-fns";
import { CalendarCheck, Clock, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useMockData } from "../../../contexts/MockDataContext";
import { getBookingsForUser, getFloorById } from "../../../data/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { CheckInTimer, getGraceDeadline } from "../bookings/CheckInTimer";

export function TodayBookingCard() {
  const { currentUser } = useDemoRole();
  const { bookings, desks, rooms, floors, checkInBooking } = useMockData();

  const today = format(new Date(), "yyyy-MM-dd");
  const userBookings = getBookingsForUser(bookings, currentUser.id);

  // Find today's active booking first
  const todayBooking = userBookings.find(
    (b) =>
      b.date === today &&
      b.status !== "cancelled" &&
      b.status !== "auto-released" &&
      b.status !== "completed"
  );

  // If no today booking, find the next upcoming one
  const nextBooking = !todayBooking
    ? userBookings
        .filter(
          (b) =>
            b.date > today &&
            (b.status === "upcoming" || b.status === "checked-in")
        )
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))[0]
    : undefined;

  const activeBooking = todayBooking ?? nextBooking;
  const isToday = activeBooking?.date === today;

  const getResourceLabel = (resourceId: string, resourceType: string) => {
    if (resourceType === "desk") {
      return desks.find((d) => d.id === resourceId)?.label ?? resourceId;
    }
    if (resourceType === "room") {
      return rooms.find((r) => r.id === resourceId)?.name ?? resourceId;
    }
    return resourceId;
  };

  const getResourceFloor = (resourceId: string, resourceType: string) => {
    let floorId: string | undefined;
    if (resourceType === "desk") {
      floorId = desks.find((d) => d.id === resourceId)?.floorId;
    } else if (resourceType === "room") {
      floorId = rooms.find((r) => r.id === resourceId)?.floorId;
    }
    if (!floorId) return "";
    return getFloorById(floors, floorId)?.name ?? "";
  };

  const graceDeadline = activeBooking && isToday
    ? getGraceDeadline(activeBooking.date, activeBooking.startTime, activeBooking.status)
    : null;
  const inGracePeriod = graceDeadline !== null;

  const handleCheckIn = () => {
    if (!activeBooking) return;
    checkInBooking(activeBooking.id);
    const label = getResourceLabel(activeBooking.resourceId, activeBooking.resourceType);
    toast.success(`Checked in to ${label}`, {
      icon: <CheckCircle2 className="h-4 w-4 text-chart-2" />,
    });
  };

  return (
    <Card className="relative pl-6">
      <div className="absolute left-1 top-1 bottom-1 w-1 rounded-full bg-primary" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarCheck className="h-4 w-4 text-primary" />
          {isToday ? "Today's booking" : "Next booking"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeBooking ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {getResourceLabel(activeBooking.resourceId, activeBooking.resourceType)}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {getResourceFloor(activeBooking.resourceId, activeBooking.resourceType)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {!isToday && (
                      <span className="font-medium text-foreground">
                        {format(new Date(activeBooking.date + "T12:00:00"), "EEE, MMM d")} ·{" "}
                      </span>
                    )}
                    {activeBooking.startTime} – {activeBooking.endTime}
                  </span>
                </div>
              </div>
              {activeBooking.status === "checked-in" ? (
                <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Checked in
                </Badge>
              ) : isToday ? (
                <Button
                  size="sm"
                  onClick={handleCheckIn}
                  className={inGracePeriod ? "animate-pulse" : ""}
                  data-testid="today-checkin-button"
                >
                  Check in
                </Button>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground">
                  {format(new Date(activeBooking.date + "T12:00:00"), "MMM d")}
                </Badge>
              )}
            </div>
            {inGracePeriod && (
              <CheckInTimer deadline={graceDeadline} />
            )}
          </div>
        ) : (
          <div className="py-6 text-center space-y-3">
            <p className="text-muted-foreground">No upcoming bookings</p>
            <Button size="default" className="gap-2" asChild>
              <Link to="/app/floor-map">
                Book a desk for today
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
