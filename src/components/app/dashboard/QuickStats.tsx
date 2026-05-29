import { format } from "date-fns";
import { Monitor, Car, Lock, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMockData } from "../../../contexts/MockDataContext";
import { getBookingsForDate } from "../../../data/helpers";
import { Card, CardContent } from "../../ui/card";

export function QuickStats() {
  const { desks, parkingSpots, lockers, bookings } = useMockData();

  const today = format(new Date(), "yyyy-MM-dd");
  const todayBookings = getBookingsForDate(bookings, today).filter(
    (b) => b.status !== "cancelled" && b.status !== "auto-released"
  );

  const bookedDeskIds = new Set(
    todayBookings
      .filter((b) => b.resourceType === "desk")
      .map((b) => b.resourceId)
  );
  const availableDesks = desks.filter(
    (d) => d.status !== "maintenance" && !bookedDeskIds.has(d.id)
  ).length;

  const bookedParkingIds = new Set(
    todayBookings.filter((b) => b.resourceType === "parking").map((b) => b.resourceId)
  );
  const availableParking = parkingSpots.filter(
    (p) => p.status !== "maintenance" && !bookedParkingIds.has(p.id)
  ).length;

  const bookedLockerIds = new Set(
    todayBookings.filter((b) => b.resourceType === "locker").map((b) => b.resourceId)
  );
  const availableLockers = lockers.filter(
    (l) => l.status !== "maintenance" && !bookedLockerIds.has(l.id)
  ).length;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
        <Link
          to="/app/floor-map"
          className="group flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-chart-2/10">
            <Monitor className="h-3.5 w-3.5 text-chart-2" />
          </div>
          <span className="font-semibold">{availableDesks}</span>
          <span className="text-muted-foreground">desks available</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <span className="hidden sm:block h-4 w-px bg-border" />

        <Link
          to="/app/resources"
          className="group flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-chart-3/10">
            <Car className="h-3.5 w-3.5 text-chart-3" />
          </div>
          <span className="font-semibold">{availableParking}</span>
          <span className="text-muted-foreground">parking spots</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <span className="hidden sm:block h-4 w-px bg-border" />

        <Link
          to="/app/resources"
          className="group flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-chart-5/10">
            <Lock className="h-3.5 w-3.5 text-chart-5" />
          </div>
          <span className="font-semibold">{availableLockers}</span>
          <span className="text-muted-foreground">lockers</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </CardContent>
    </Card>
  );
}
