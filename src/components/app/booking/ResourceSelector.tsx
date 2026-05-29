import { useMemo } from "react";
import { toast } from "sonner";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useMockData } from "../../../contexts/MockDataContext";
import { getAvailableDesks, getFloorById, getZoneById } from "../../../data/helpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import type { ResourceType } from "../../../data/types";

interface ResourceSelectorProps {
  resourceType: ResourceType;
  date: string;
  startTime: string;
  endTime: string;
  value: string;
  onChange: (value: string) => void;
}

export function ResourceSelector({
  resourceType,
  date,
  startTime,
  endTime,
  value,
  onChange,
}: ResourceSelectorProps) {
  const { currentUser } = useDemoRole();
  const {
    desks, rooms, parkingSpots, lockers, bookings, floors, zones,
    joinWaitlist, getWaitlistPosition,
  } = useMockData();

  const bookedResourceIds = useMemo(() => {
    return new Set(
      bookings
        .filter(
          (b) =>
            b.resourceType === resourceType &&
            b.date === date &&
            b.status !== "cancelled" &&
            b.status !== "auto-released" &&
            b.status !== "completed" &&
            b.startTime < endTime &&
            b.endTime > startTime
        )
        .map((b) => b.resourceId)
    );
  }, [bookings, resourceType, date, startTime, endTime]);

  const handleJoinWaitlist = (resourceId: string) => {
    joinWaitlist(resourceId, resourceType, date, startTime, endTime, currentUser.id);
    toast.success("Joined waitlist");
  };

  if (resourceType === "desk") {
    const availableDesks = getAvailableDesks(desks, bookings, date, startTime, endTime);
    const availableIds = new Set(availableDesks.map((d) => d.id));

    return (
      <div className="space-y-1">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a desk" />
          </SelectTrigger>
          <SelectContent>
            {desks
              .filter((d) => d.status !== "maintenance")
              .map((desk) => {
                const available = availableIds.has(desk.id);
                const floor = getFloorById(floors, desk.floorId);
                const zone = getZoneById(zones, desk.zoneId);
                const wlPos = getWaitlistPosition(desk.id, currentUser.id, date);
                return (
                  <SelectItem key={desk.id} value={desk.id} disabled={!available}>
                    {desk.label} · {floor?.name} · {zone?.name}
                    {!available && wlPos !== null ? ` · Waitlist #${wlPos}` : ""}
                    {!available && wlPos === null ? " (Booked)" : ""}
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
        {value && !availableIds.has(value) && getWaitlistPosition(value, currentUser.id, date) === null && (
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleJoinWaitlist(value)}>
            Join waitlist
          </Button>
        )}
      </div>
    );
  }

  if (resourceType === "room") {
    return (
      <div className="space-y-1">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a room" />
          </SelectTrigger>
          <SelectContent>
            {rooms
              .filter((r) => r.status !== "maintenance")
              .map((room) => {
                const available = !bookedResourceIds.has(room.id);
                const floor = getFloorById(floors, room.floorId);
                return (
                  <SelectItem key={room.id} value={room.id} disabled={!available}>
                    {room.name} · {floor?.name} · {room.capacity} people
                    {!available ? " (Booked)" : ""}
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (resourceType === "parking") {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a parking spot" />
        </SelectTrigger>
        <SelectContent>
          {parkingSpots
            .filter((p) => p.status !== "maintenance")
            .map((spot) => {
              const available = !bookedResourceIds.has(spot.id);
              return (
                <SelectItem key={spot.id} value={spot.id} disabled={!available}>
                  {spot.label} — {spot.location}
                  {!available ? " (Booked)" : ""}
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>
    );
  }

  // Locker
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a locker" />
      </SelectTrigger>
      <SelectContent>
        {lockers
          .filter((l) => l.status !== "maintenance")
          .map((locker) => {
            const available = !bookedResourceIds.has(locker.id);
            return (
              <SelectItem key={locker.id} value={locker.id} disabled={!available}>
                {locker.label} — {locker.size.charAt(0).toUpperCase() + locker.size.slice(1)} · {locker.location}
                {!available ? " (Booked)" : ""}
              </SelectItem>
            );
          })}
      </SelectContent>
    </Select>
  );
}
