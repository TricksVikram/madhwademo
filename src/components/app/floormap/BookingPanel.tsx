import { useState } from "react";
import { format } from "date-fns";
import { X, Clock, MapPin, ChevronRight, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Badge } from "../../ui/badge";
import { useMockData } from "../../../contexts/MockDataContext";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { getFloorById, getZoneById, getBookingsForDate } from "../../../data/helpers";
import type { CanvasObject, Booking } from "../../../data/types";

const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00",
];

const TIME_PRESETS = [
  { label: "Morning", start: "09:00", end: "12:00" },
  { label: "Afternoon", start: "13:00", end: "17:00" },
  { label: "Full day", start: "09:00", end: "17:00" },
];

interface BookingPanelProps {
  selectedObject: CanvasObject;
  date: string;
  onClose: () => void;
  onOpenFullDialog: () => void;
}

export function BookingPanel({
  selectedObject,
  date,
  onClose,
  onOpenFullDialog,
}: BookingPanelProps) {
  const { currentUser } = useDemoRole();
  const { desks, rooms, floors, zones, bookings, users, createBooking } = useMockData();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const resourceId = selectedObject.resourceId;
  const isDesk = selectedObject.type === "desk";
  const resource = isDesk
    ? desks.find((d) => d.id === resourceId)
    : rooms.find((r) => r.id === resourceId);

  if (!resource || !resourceId) return null;

  const floor = getFloorById(floors, resource.floorId);
  const zone = isDesk ? getZoneById(zones, (resource as any).zoneId) : null;
  const label = isDesk ? (resource as any).label : (resource as any).name;
  const dateFormatted = format(new Date(date), "EEE, MMM d");

  // Check if this resource is already booked
  const todayBookings = getBookingsForDate(bookings, date).filter(
    (b) =>
      b.resourceId === resourceId &&
      b.status !== "cancelled" &&
      b.status !== "auto-released"
  );
  const activeBooking = todayBookings[0];
  const isBooked = !!activeBooking;
  const occupant = isBooked
    ? users.find((u) => u.id === activeBooking.userId)
    : undefined;

  const handleBook = () => {
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }
    createBooking({
      resourceType: isDesk ? "desk" : "room",
      resourceId,
      userId: currentUser.id,
      date,
      startTime,
      endTime,
    });
    toast.success(`${isDesk ? "Desk" : "Room"} booked successfully!`, {
      action: {
        label: "View booking",
        onClick: () => { window.location.href = "/app/bookings"; },
      },
    });
    onClose();
  };

  const applyPreset = (preset: typeof TIME_PRESETS[0]) => {
    setStartTime(preset.start);
    setEndTime(preset.end);
  };

  // If booked, show occupant info instead of booking form
  if (isBooked && occupant) {
    return (
      <div className="absolute right-4 top-4 z-20 w-72 rounded-xl border border-border bg-card shadow-lg animate-in slide-in-from-right-4 fade-in duration-200" data-testid="booking-panel">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-foreground">{label}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{floor?.name}{zone ? ` · ${zone.name}` : ""}</span>
          </div>

          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            Booked
          </Badge>

          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <UserIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{occupant.name}</p>
              <p className="text-xs text-muted-foreground">
                {activeBooking.startTime} – {activeBooking.endTime}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Available after {activeBooking.endTime}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-4 top-4 z-20 w-72 rounded-xl border border-border bg-card shadow-lg animate-in slide-in-from-right-4 fade-in duration-200" data-testid="booking-panel">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-3 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{floor?.name}{zone ? ` · ${zone.name}` : ""}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{dateFormatted}</span>
        </div>

        {/* Time presets */}
        <div className="flex gap-1.5">
          {TIME_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                startTime === preset.start && endTime === preset.end
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Time selectors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Start</label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">End</label>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <Button onClick={handleBook} className="w-full" size="sm">
          Book now
        </Button>

        <button
          onClick={onOpenFullDialog}
          className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          More options
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
