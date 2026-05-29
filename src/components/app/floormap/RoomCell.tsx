import { useMemo } from "react";
import { Users, Wrench } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useMockData } from "../../../contexts/MockDataContext";
import { getUserById } from "../../../data/helpers";
import { getResourceStatus } from "../../../data/status-resolver";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import type { Booking, Room } from "../../../data/types";

interface RoomCellProps {
  room: Room;
  date: string;
  bookings: Booking[];
  onBook: () => void;
}

type RoomVisualStatus = "available" | "booked" | "occupied" | "maintenance";

const STATUS_STYLES: Record<RoomVisualStatus, string> = {
  available:
    "bg-chart-2/10 border-chart-2/30 hover:bg-chart-2/20 hover:scale-[1.02] cursor-pointer",
  booked: "bg-primary/10 border-primary/30 cursor-pointer",
  occupied: "bg-chart-4/10 border-chart-4/30 cursor-pointer",
  maintenance: "bg-muted border-border opacity-60 cursor-not-allowed",
};

export function RoomCell({ room, date, bookings, onBook }: RoomCellProps) {
  const { currentUser } = useDemoRole();
  const { users } = useMockData();

  const booking = useMemo(
    () => bookings.find((b) => b.resourceId === room.id && b.resourceType === "room"),
    [bookings, room.id]
  );

  const status = useMemo(
    () => getResourceStatus(room.id, room.status, bookings, new Date()),
    [room.id, room.status, bookings]
  );

  const occupant = booking ? getUserById(users, booking.userId) : undefined;
  const colSpan = room.capacity > 10 ? "col-span-2" : "";
  const isOccupied = status === "occupied";

  const statusDot = status !== "maintenance" && (
    <div className="relative">
      <div
        className={`h-2 w-2 rounded-full ${
          status === "available"
            ? "bg-chart-2"
            : status === "occupied"
              ? "bg-chart-4"
              : "bg-primary"
        }`}
      />
      {isOccupied && (
        <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-chart-4/40" />
      )}
    </div>
  );

  if (status === "available") {
    return (
      <button
        onClick={onBook}
        className={`flex items-center gap-2 rounded-lg border p-3 transition-all ${STATUS_STYLES[status]} ${colSpan}`}
      >
        {statusDot}
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-foreground">{room.name}</span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Users className="h-3 w-3" /> {room.capacity}
          </span>
        </div>
      </button>
    );
  }

  if (status === "maintenance") {
    return (
      <div className={`flex items-center gap-2 rounded-lg border p-3 ${STATUS_STYLES[status]} ${colSpan}`}>
        <Wrench className="h-3 w-3 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground">{room.name}</span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Users className="h-3 w-3" /> {room.capacity}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={`flex items-center gap-2 rounded-lg border p-3 transition-all ${STATUS_STYLES[status]} ${colSpan}`}>
          {statusDot}
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground">{room.name}</span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Users className="h-3 w-3" /> {room.capacity}
            </span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="center">
        <div className="space-y-2">
          {occupant && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={occupant.avatar} alt={occupant.name} />
                <AvatarFallback className="text-[10px]">
                  {occupant.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">{occupant.name}</span>
            </div>
          )}
          {booking && (
            <p className="text-xs text-muted-foreground">
              {booking.startTime} – {booking.endTime}
            </p>
          )}
          <Link
            to="/app/calendar"
            className="inline-block text-xs font-medium text-primary hover:underline"
          >
            View in calendar
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
