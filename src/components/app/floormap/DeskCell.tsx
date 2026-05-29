import { useMemo } from "react";
import { Wrench } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useMockData } from "../../../contexts/MockDataContext";
import { getUserById } from "../../../data/helpers";
import { getResourceStatus } from "../../../data/status-resolver";
import { CheckInTimer, getGraceDeadline } from "../bookings/CheckInTimer";
import { QRCode } from "../checkin/QRCode";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { Button } from "../../ui/button";
import type { Booking, Desk, User } from "../../../data/types";

interface DeskCellProps {
  desk: Desk;
  date: string;
  bookings: Booking[];
  onBook: () => void;
  teammateAvatar?: User;
}

type DeskVisualStatus = "available" | "booked-other" | "booked-self" | "occupied" | "maintenance";

const STATUS_STYLES: Record<DeskVisualStatus, string> = {
  available:
    "bg-chart-2/10 border-chart-2/30 hover:bg-chart-2/20 hover:scale-105 cursor-pointer",
  "booked-other": "bg-primary/10 border-primary/30 cursor-pointer",
  "booked-self": "bg-primary/20 border-primary/50 ring-1 ring-primary/30 cursor-pointer",
  occupied: "bg-chart-4/10 border-chart-4/30 cursor-pointer",
  maintenance: "bg-muted border-border opacity-60 cursor-not-allowed",
};

const DOT_STYLES: Record<DeskVisualStatus, string> = {
  available: "bg-chart-2",
  "booked-other": "bg-primary",
  "booked-self": "bg-primary",
  occupied: "bg-chart-4",
  maintenance: "bg-muted-foreground",
};

export function DeskCell({ desk, date, bookings, onBook, teammateAvatar }: DeskCellProps) {
  const { currentUser } = useDemoRole();
  const { users, checkInBooking, joinWaitlist, getWaitlistPosition } = useMockData();

  const booking = useMemo(
    () => bookings.find((b) => b.resourceId === desk.id && b.resourceType === "desk"),
    [bookings, desk.id]
  );

  const resolvedStatus = useMemo(
    () => getResourceStatus(desk.id, desk.status, bookings, new Date()),
    [desk.id, desk.status, bookings]
  );

  const visualStatus: DeskVisualStatus = useMemo(() => {
    if (resolvedStatus === "maintenance") return "maintenance";
    if (resolvedStatus === "available") return "available";
    if (resolvedStatus === "occupied") return "occupied";
    if (booking?.userId === currentUser.id) return "booked-self";
    return "booked-other";
  }, [resolvedStatus, booking, currentUser.id]);

  const occupant = booking ? getUserById(users, booking.userId) : undefined;
  const isOccupied = visualStatus === "occupied";
  const isSelfBooked = visualStatus === "booked-self";

  const isBuddyGroup = !!booking?.buddyGroupId;
  const buddyMembers = useMemo(() => {
    if (!booking?.buddyGroupId) return [];
    return bookings
      .filter((b) => b.buddyGroupId === booking.buddyGroupId && b.id !== booking.id)
      .map((b) => getUserById(users, b.userId))
      .filter(Boolean);
  }, [booking, bookings, users]);

  const graceDeadline =
    isSelfBooked && booking
      ? getGraceDeadline(booking.date, booking.startTime, booking.status)
      : null;

  const dot = (
    <div className="relative mb-1">
      <div className={`h-2 w-2 rounded-full ${DOT_STYLES[visualStatus]}`} />
      {isOccupied && (
        <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-chart-4/40" />
      )}
    </div>
  );

  if (visualStatus === "available") {
    return (
      <button
        onClick={onBook}
        className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg border p-2 transition-all ${STATUS_STYLES[visualStatus]}`}
      >
        {dot}
        <span className="text-xs font-medium text-foreground">{desk.label}</span>
      </button>
    );
  }

  if (visualStatus === "maintenance") {
    return (
      <div className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg border p-2 ${STATUS_STYLES[visualStatus]}`}>
        <Wrench className="mb-1 h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{desk.label}</span>
      </div>
    );
  }

  const handleCheckIn = () => {
    if (!booking) return;
    checkInBooking(booking.id);
    toast.success(`Checked in to ${desk.label}`);
  };

  const avatarOverlay = teammateAvatar ? (
    <Avatar className="h-6 w-6 absolute -top-1 -right-1 ring-2 ring-background">
      <AvatarImage src={teammateAvatar.avatar} alt={teammateAvatar.name} />
      <AvatarFallback className="text-[8px]">
        {teammateAvatar.name.split(" ").map((n) => n[0]).join("")}
      </AvatarFallback>
    </Avatar>
  ) : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`relative flex min-h-[44px] flex-col items-center justify-center rounded-lg border p-2 transition-all ${STATUS_STYLES[visualStatus]} ${isBuddyGroup ? "ring-2 ring-primary/30" : ""}`}
        >
          {avatarOverlay}
          {dot}
          <span className="text-xs font-medium text-foreground">{desk.label}</span>
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
          {isBuddyGroup && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-primary">Buddy group</p>
              <div className="flex flex-wrap gap-1">
                {buddyMembers.map((m) => m && (
                  <span key={m.id} className="text-[10px] text-muted-foreground">{m.name}</span>
                ))}
              </div>
            </div>
          )}
          {graceDeadline && (
            <div className="space-y-2">
              <CheckInTimer deadline={graceDeadline} compact />
              <Button size="sm" className="w-full animate-pulse" onClick={handleCheckIn}>
                Check in
              </Button>
            </div>
          )}
          {isSelfBooked && (
            <Link to="/app/checkin/$resourceId" params={{ resourceId: desk.id }} className="block">
              <QRCode resourceId={desk.id} label="Scan to check in" size={80} />
            </Link>
          )}
          {visualStatus === "booked-other" && booking && (() => {
            const wlPos = getWaitlistPosition(desk.id, currentUser.id, date);
            if (wlPos !== null) {
              return <p className="text-[10px] text-chart-4 font-medium">On waitlist (#{wlPos})</p>;
            }
            return (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  joinWaitlist(desk.id, "desk", date, booking.startTime, booking.endTime, currentUser.id);
                  toast.success(`Joined waitlist for ${desk.label}`);
                }}
              >
                Join waitlist
              </Button>
            );
          })()}
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
