import { useState } from "react";
import { format } from "date-fns";
import { Monitor, DoorOpen, Car, Lock, Repeat, CheckCircle2, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useMockData } from "../../../contexts/MockDataContext";
import { getFloorById, getZoneById } from "../../../data/helpers";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
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
import { CheckInTimer, getGraceDeadline } from "./CheckInTimer";
import type { Booking, BookingStatus } from "../../../data/types";

const STATUS_BADGE: Record<BookingStatus, string> = {
  upcoming: "bg-primary/10 text-primary border-primary/20",
  "checked-in": "bg-chart-2/10 text-chart-2 border-chart-2/20",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  "auto-released": "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

const STATUS_BORDER: Record<BookingStatus, string> = {
  upcoming: "border-l-primary",
  "checked-in": "border-l-chart-2",
  completed: "border-l-muted-foreground",
  cancelled: "border-l-destructive",
  "auto-released": "border-l-chart-4",
};

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onModify?: (booking: Booking) => void;
  onBookAgain?: (booking: Booking) => void;
}

export function BookingCard({ booking, showActions = false, onModify, onBookAgain }: BookingCardProps) {
  const { desks, rooms, parkingSpots, lockers, floors, zones, checkInBooking, cancelBooking } =
    useMockData();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const resourceLabel =
    booking.resourceType === "desk"
      ? desks.find((d) => d.id === booking.resourceId)?.label
      : booking.resourceType === "room"
      ? rooms.find((r) => r.id === booking.resourceId)?.name
      : booking.resourceType === "parking"
      ? parkingSpots.find((p) => p.id === booking.resourceId)?.label
      : lockers.find((l) => l.id === booking.resourceId)?.label;

  const resource =
    booking.resourceType === "desk"
      ? desks.find((d) => d.id === booking.resourceId)
      : booking.resourceType === "room"
      ? rooms.find((r) => r.id === booking.resourceId)
      : undefined;

  const resourceInfo =
    booking.resourceType === "parking"
      ? parkingSpots.find((p) => p.id === booking.resourceId)?.location
      : booking.resourceType === "locker"
      ? (() => { const l = lockers.find((l) => l.id === booking.resourceId); return l ? `${l.size.charAt(0).toUpperCase() + l.size.slice(1)} · ${l.location}` : undefined; })()
      : undefined;

  const floor = resource ? getFloorById(floors, resource.floorId) : undefined;
  const zone =
    booking.resourceType === "desk" && resource && "zoneId" in resource
      ? getZoneById(zones, resource.zoneId)
      : undefined;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayStr = format(now, "yyyy-MM-dd");
  const [sh, sm] = booking.startTime.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const canCheckIn =
    booking.status === "upcoming" &&
    booking.date === todayStr &&
    currentMinutes >= startMinutes - 15;

  const graceDeadline = getGraceDeadline(
    booking.date,
    booking.startTime,
    booking.status
  );
  const inGracePeriod = graceDeadline !== null;

  const TypeIcon =
    booking.resourceType === "desk" ? Monitor
    : booking.resourceType === "room" ? DoorOpen
    : booking.resourceType === "parking" ? Car
    : Lock;

  const handleCheckIn = () => {
    checkInBooking(booking.id);
    setJustCheckedIn(true);
    toast.success(
      `Checked in to ${resourceLabel}`,
      { icon: <CheckCircle2 className="h-4 w-4 text-chart-2" /> }
    );
    setTimeout(() => setJustCheckedIn(false), 3000);
  };

  const handleCancel = () => {
    cancelBooking(booking.id);
    toast.success(`Booking for ${resourceLabel} cancelled`);
    setShowCancelDialog(false);
  };

  return (
    <>
      <div
        className={`flex flex-col gap-3 rounded-lg border border-l-4 bg-card p-4 sm:flex-row sm:items-center sm:justify-between ${booking.guestInfo ? "border-l-chart-5" : STATUS_BORDER[booking.status]}`}
        data-testid={`booking-card-${booking.id}`}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {resourceLabel ?? booking.resourceId}
              </span>
              {booking.isRecurring && (
                <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {booking.guestInfo && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-chart-5/10 text-chart-5 border-chart-5/20"
                >
                  Guest
                </Badge>
              )}
              {justCheckedIn ? (
                <Badge
                  variant="outline"
                  className="animate-in zoom-in-50 bg-chart-2/10 text-chart-2 border-chart-2/20"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Checked in!
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className={`text-[10px] ${STATUS_BADGE[booking.status]}`}
                >
                  {booking.status}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {floor?.name ?? resourceInfo ?? ""}
              {zone ? ` · ${zone.name}` : ""}
            </p>
            {booking.guestInfo && (
              <p className="text-xs text-chart-5 font-medium">
                {booking.guestInfo.name}
                {booking.guestInfo.company ? ` · ${booking.guestInfo.company}` : ""}
              </p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {format(new Date(booking.date + "T12:00:00"), "EEE, MMM d")} ·{" "}
              {booking.startTime} – {booking.endTime}
            </p>
            {inGracePeriod && showActions && (
              <div className="mt-2">
                <CheckInTimer deadline={graceDeadline} />
              </div>
            )}
          </div>
        </div>

        {showActions && booking.status === "upcoming" && (
          <div className="flex shrink-0 gap-2">
            {canCheckIn && (
              <Button
                size="sm"
                onClick={handleCheckIn}
                className={inGracePeriod ? "animate-pulse" : ""}
                data-testid={`checkin-button-${booking.id}`}
              >
                Check in
              </Button>
            )}
            {onModify && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => onModify(booking)}
              >
                <Pencil className="h-3 w-3" />
                Modify
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setShowCancelDialog(true)}
              data-testid={`cancel-button-${booking.id}`}
            >
              Cancel
            </Button>
          </div>
        )}

        {showActions && booking.status === "checked-in" && !justCheckedIn && (
          <Badge
            variant="outline"
            className="shrink-0 bg-chart-2/10 text-chart-2 border-chart-2/20"
          >
            Checked in
          </Badge>
        )}

        {onBookAgain && (booking.status === "completed" || booking.status === "cancelled" || booking.status === "auto-released") && (
          <Button
            size="sm"
            variant="ghost"
            className="shrink-0 gap-1 text-xs text-muted-foreground"
            onClick={() => onBookAgain(booking)}
          >
            <RotateCcw className="h-3 w-3" />
            Book again
          </Button>
        )}
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent data-testid="cancel-booking-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your booking for{" "}
              {resourceLabel ?? booking.resourceId}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCancel}
              data-testid="confirm-cancel-booking"
            >
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
