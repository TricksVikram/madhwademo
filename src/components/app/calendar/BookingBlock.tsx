import { useState } from "react";
import { Repeat } from "lucide-react";
import { useMockData } from "../../../contexts/MockDataContext";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { getUserById, getFloorById, getZoneById } from "../../../data/helpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import type { Booking, BookingStatus } from "../../../data/types";

function formatShortTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "p" : "a";
  const hour12 = h % 12 || 12;
  return m > 0 ? `${hour12}:${m.toString().padStart(2, "0")}${suffix}` : `${hour12}${suffix}`;
}

const STATUS_CLASSES: Record<BookingStatus, string> = {
  upcoming: "bg-primary/20 border-primary/40 text-primary",
  "checked-in": "bg-chart-2/20 border-chart-2/40 text-chart-2",
  completed: "bg-muted border-border text-muted-foreground",
  cancelled: "bg-muted border-border text-muted-foreground",
  "auto-released": "bg-muted border-border text-muted-foreground",
};

const STATUS_BADGE: Record<BookingStatus, string> = {
  upcoming: "bg-primary/10 text-primary border-primary/20",
  "checked-in": "bg-chart-2/10 text-chart-2 border-chart-2/20",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  "auto-released": "bg-destructive/10 text-destructive",
};

interface BookingBlockProps {
  booking: Booking;
  compact?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function BookingBlock({
  booking,
  compact = false,
  style,
  className = "",
}: BookingBlockProps) {
  const { users, desks, rooms, floors, zones, bookings, cancelBooking, cancelRecurringSeries } =
    useMockData();
  const { currentUser } = useDemoRole();
  const [showCancelChoice, setShowCancelChoice] = useState(false);

  const user = getUserById(users, booking.userId);
  const resourceLabel =
    booking.resourceType === "desk"
      ? desks.find((d) => d.id === booking.resourceId)?.label
      : rooms.find((r) => r.id === booking.resourceId)?.name;

  const resource =
    booking.resourceType === "desk"
      ? desks.find((d) => d.id === booking.resourceId)
      : rooms.find((r) => r.id === booking.resourceId);

  const floor = resource ? getFloorById(floors, resource.floorId) : undefined;

  const zone =
    booking.resourceType === "desk" && resource && "zoneId" in resource
      ? getZoneById(zones, resource.zoneId)
      : undefined;

  const isOwn = booking.userId === currentUser.id;
  const canCancel =
    isOwn && (booking.status === "upcoming" || booking.status === "checked-in");

  const seriesCount = booking.recurringGroupId
    ? bookings.filter((b) => b.recurringGroupId === booking.recurringGroupId)
        .length
    : 0;

  const statusClasses = STATUS_CLASSES[booking.status];
  const timeLabel = `${formatShortTime(booking.startTime)}–${formatShortTime(booking.endTime)}`;

  const handleCancelClick = () => {
    if (booking.isRecurring && booking.recurringGroupId) {
      setShowCancelChoice(true);
    } else {
      cancelBooking(booking.id);
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={`cursor-pointer overflow-hidden rounded border px-1.5 py-0.5 text-left text-xs font-medium transition-opacity hover:opacity-80 ${statusClasses} ${className}`}
            style={style}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="flex items-center gap-1 truncate">
              {booking.isRecurring && (
                <Repeat className="h-2.5 w-2.5 shrink-0 opacity-60" />
              )}
              <span className="truncate">
                {resourceLabel ?? booking.resourceId}
              </span>
            </span>
            {!compact && user && (
              <span className="block truncate text-[10px] opacity-70">
                {user.name}
              </span>
            )}
            {!compact && (
              <span className="block truncate text-[10px] opacity-60">
                {timeLabel}
              </span>
            )}
            {compact && (
              <span className="block truncate text-[9px] opacity-60">
                {timeLabel}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  {resourceLabel ?? booking.resourceId}
                </p>
                <p className="text-xs text-muted-foreground">
                  {floor?.name}
                  {zone ? ` · ${zone.name}` : ""}
                </p>
              </div>
              <Badge variant="outline" className={STATUS_BADGE[booking.status]}>
                {booking.status}
              </Badge>
            </div>

            {user && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-[10px]">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{user.name}</span>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {booking.startTime} – {booking.endTime}
            </p>

            {booking.isRecurring && seriesCount > 0 && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Repeat className="h-3 w-3" />
                Part of recurring series ({seriesCount} bookings)
              </p>
            )}

            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleCancelClick}
              >
                Cancel booking
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={showCancelChoice} onOpenChange={setShowCancelChoice}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel recurring booking</AlertDialogTitle>
            <AlertDialogDescription>
              This booking is part of a recurring series. How would you like to
              cancel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelBooking(booking.id)}
            >
              Cancel this booking only
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                cancelRecurringSeries(
                  booking.recurringGroupId!,
                  booking.date
                )
              }
            >
              Cancel all future
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
