import { useMockData } from "../../../contexts/MockDataContext";
import { getBookingsForDate } from "../../../data/helpers";
import { format } from "date-fns";
import { Building2, Monitor, DoorOpen, Car, Lock } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import type { LucideIcon } from "lucide-react";

function MiniStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResourceSummaryCards() {
  const { floors, desks, rooms, parkingSpots, lockers, bookings } = useMockData();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayBookings = getBookingsForDate(bookings, today).filter(
    (b) => b.status !== "cancelled" && b.status !== "auto-released"
  );
  const bookedDeskIds = new Set(todayBookings.filter((b) => b.resourceType === "desk").map((b) => b.resourceId));
  const availableDesks = desks.filter((d) => d.status !== "maintenance" && !bookedDeskIds.has(d.id)).length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <MiniStat icon={Building2} label="Total floors" value={String(floors.length)} />
      <MiniStat icon={Monitor} label="Desks" value={`${availableDesks}/${desks.length}`} />
      <MiniStat icon={DoorOpen} label="Total rooms" value={String(rooms.length)} />
      <MiniStat icon={Car} label="Parking spots" value={String(parkingSpots.length)} />
      <MiniStat icon={Lock} label="Lockers" value={String(lockers.length)} />
    </div>
  );
}
