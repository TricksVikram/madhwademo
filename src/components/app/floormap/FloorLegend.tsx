import { useMemo } from "react";
import { useMockData } from "../../../contexts/MockDataContext";
import { getDesksForFloor, getRoomsForFloor } from "../../../data/helpers";

interface FloorLegendProps {
  floorId: string;
  date: string;
}

const LEGEND_ITEMS = [
  { label: "Available", className: "bg-chart-2/20 border-chart-2/40" },
  { label: "Booked", className: "bg-primary/20 border-primary/40" },
  { label: "Occupied", className: "bg-chart-4/20 border-chart-4/40" },
  { label: "Maintenance", className: "bg-muted border-border" },
];

export function FloorLegend({ floorId, date }: FloorLegendProps) {
  const { desks, rooms, bookings } = useMockData();

  const floorDesks = useMemo(
    () => desks.filter((d) => d.floorId === floorId),
    [desks, floorId]
  );
  const floorRooms = useMemo(
    () => rooms.filter((r) => r.floorId === floorId),
    [rooms, floorId]
  );

  const counts = useMemo(() => {
    const bookedIds = new Set(
      bookings
        .filter(
          (b) =>
            b.date === date &&
            b.status !== "cancelled" &&
            b.status !== "auto-released" &&
            b.status !== "completed"
        )
        .map((b) => b.resourceId)
    );

    const occupiedIds = new Set(
      bookings
        .filter((b) => b.date === date && b.status === "checked-in")
        .map((b) => b.resourceId)
    );

    const allResources = [
      ...floorDesks.map((d) => ({ id: d.id, status: d.status })),
      ...floorRooms.map((r) => ({ id: r.id, status: r.status })),
    ];

    let available = 0;
    let booked = 0;
    let occupied = 0;
    let maintenance = 0;

    for (const r of allResources) {
      if (r.status === "maintenance") {
        maintenance++;
      } else if (occupiedIds.has(r.id)) {
        occupied++;
      } else if (bookedIds.has(r.id)) {
        booked++;
      } else {
        available++;
      }
    }

    return { available, booked, occupied, maintenance };
  }, [floorDesks, floorRooms, bookings, date]);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-3">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={`h-3 w-3 rounded border ${item.className}`} />
            {item.label}
          </div>
        ))}
      </div>
      <div className="ml-auto text-xs text-muted-foreground">
        {counts.available} available · {counts.booked} booked · {counts.occupied} occupied
      </div>
    </div>
  );
}
