import { useMemo } from "react";
import { useMockData } from "../../../contexts/MockDataContext";
import { getZonesForFloor, getDesksForZone, getRoomsForFloor } from "../../../data/helpers";
import { DeskCell } from "./DeskCell";
import { RoomCell } from "./RoomCell";

interface ZoneLayoutProps {
  floorId: string;
  date: string;
  onBookResource: (resourceId: string, resourceType: "desk" | "room") => void;
  showTeammateIds?: Set<string>;
}

export function ZoneLayout({ floorId, date, onBookResource, showTeammateIds }: ZoneLayoutProps) {
  const { zones, desks, rooms, bookings, users } = useMockData();

  const floorZones = useMemo(
    () => getZonesForFloor(zones, floorId),
    [zones, floorId]
  );

  const floorRooms = useMemo(
    () => rooms.filter((r) => r.floorId === floorId),
    [rooms, floorId]
  );

  const dateBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.date === date &&
          b.status !== "cancelled" &&
          b.status !== "auto-released" &&
          b.status !== "completed"
      ),
    [bookings, date]
  );

  return (
    <div className="space-y-6">
      {floorZones.map((zone) => {
        const zoneDesks = getDesksForZone(desks, zone.id);

        return (
          <div
            key={zone.id}
            className="rounded-lg border border-border bg-card p-4"
            style={{ borderLeftColor: zone.color, borderLeftWidth: 4 }}
          >
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {zone.name}
            </h3>

            {/* Desk grid */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {zoneDesks.map((desk) => {
                const deskBooking = dateBookings.find(
                  (b) => b.resourceId === desk.id && b.resourceType === "desk"
                );
                const showAvatar =
                  showTeammateIds &&
                  showTeammateIds.size > 0 &&
                  deskBooking &&
                  showTeammateIds.has(deskBooking.userId);
                const avatarUser = showAvatar
                  ? users.find((u) => u.id === deskBooking.userId)
                  : undefined;

                return (
                  <DeskCell
                    key={desk.id}
                    desk={desk}
                    date={date}
                    bookings={dateBookings}
                    onBook={() => onBookResource(desk.id, "desk")}
                    teammateAvatar={avatarUser}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Rooms section */}
      {floorRooms.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Meeting rooms
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {floorRooms.map((room) => (
              <RoomCell
                key={room.id}
                room={room}
                date={date}
                bookings={dateBookings}
                onBook={() => onBookResource(room.id, "room")}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
