import { useState, useEffect, useCallback, useMemo } from "react";
import { format, addDays, getDay } from "date-fns";
import { CalendarIcon, Users, UserPlus, Map, ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useMockData } from "../../../contexts/MockDataContext";
import { useIsMobile } from "../../../hooks/use-mobile";
import { findNearbyDesks } from "../../../data/buddy-helpers";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../../ui/drawer";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Switch } from "../../ui/switch";
import { Checkbox } from "../../ui/checkbox";
import { ResourceSelector } from "./ResourceSelector";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { VisitorBadge } from "../visitors/VisitorBadge";
import type { BookingPrefill } from "./useBookingDialog";
import type { GuestInfo, ResourceType } from "../../../data/types";

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
}).filter((t) => t <= "19:30");

function addOneHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const newH = h + 1;
  if (newH > 20) return "20:00";
  return `${newH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

type Frequency = "daily" | "weekly" | "biweekly";
const DAYS_OF_WEEK = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
];

function generateRecurringDates(
  startDate: string,
  frequency: Frequency,
  selectedDays: number[],
  occurrences: number
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T12:00:00");
  let current = start;

  if (frequency === "daily") {
    for (let i = 0; i < occurrences; i++) {
      dates.push(format(current, "yyyy-MM-dd"));
      current = addDays(current, 1);
    }
  } else {
    const interval = frequency === "biweekly" ? 14 : 7;
    // For weekly/biweekly, iterate week by week and pick selected days
    let weekStart = current;
    while (dates.length < occurrences) {
      for (const day of selectedDays.sort((a, b) => a - b)) {
        if (dates.length >= occurrences) break;
        const diff = (day - getDay(weekStart) + 7) % 7;
        const d = addDays(weekStart, diff);
        if (d >= start) {
          dates.push(format(d, "yyyy-MM-dd"));
        }
      }
      weekStart = addDays(weekStart, interval);
    }
  }

  return dates.slice(0, occurrences);
}

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: BookingPrefill;
}

export function BookingDialog({ isOpen, onClose, prefill }: BookingDialogProps) {
  const isMobile = useIsMobile();
  const { currentUser } = useDemoRole();
  const { createBooking, desks, rooms, users, bookings } = useMockData();

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Find current user's team members
  const currentMockUser = users.find((u) => u.id === currentUser.id);
  const teammates = useMemo(
    () =>
      users.filter(
        (u) => u.id !== currentUser.id && u.teamId === currentMockUser?.teamId
      ),
    [users, currentUser.id, currentMockUser?.teamId]
  );

  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [resourceType, setResourceType] = useState<ResourceType>(prefill?.resourceType ?? "desk");
  const [resourceId, setResourceId] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Recurrence state
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [occurrences, setOccurrences] = useState(4);

  // Buddy booking state
  const [buddyEnabled, setBuddyEnabled] = useState(false);
  const [selectedBuddyIds, setSelectedBuddyIds] = useState<string[]>([]);

  // Guest booking state
  const [guestEnabled, setGuestEnabled] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestCompany, setGuestCompany] = useState("");

  // Visitor badge state
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [lastGuestInfo, setLastGuestInfo] = useState<GuestInfo | null>(null);
  const [lastBookingDate, setLastBookingDate] = useState("");

  // Advanced options collapsed state
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Auto-select first available desk
  const firstAvailableDesk = useMemo(() => {
    if (resourceType !== "desk") return undefined;
    const activeBookings = bookings.filter(
      (b) =>
        b.date === date &&
        b.resourceType === "desk" &&
        b.status !== "cancelled" &&
        b.status !== "auto-released" &&
        b.status !== "completed" &&
        b.startTime < endTime &&
        b.endTime > startTime
    );
    const bookedIds = new Set(activeBookings.map((b) => b.resourceId));
    return desks.find((d) => d.status !== "maintenance" && !bookedIds.has(d.id));
  }, [desks, bookings, date, startTime, endTime, resourceType]);

  useEffect(() => {
    if (isOpen) {
      setDate(prefill?.date ?? todayStr);
      setStartTime(prefill?.startTime ?? "09:00");
      setEndTime(addOneHour(prefill?.startTime ?? "09:00"));
      setResourceType(prefill?.resourceType ?? "desk");
      setResourceId(prefill?.resourceId ?? "");
      setNotes("");
      setErrors({});
      setSubmitting(false);
      setRepeatEnabled(false);
      setFrequency("weekly");
      const dayOfWeek = getDay(
        new Date((prefill?.date ?? todayStr) + "T12:00:00")
      );
      setSelectedDays([dayOfWeek === 0 ? 7 : dayOfWeek]);
      setOccurrences(4);
      setBuddyEnabled(false);
      setSelectedBuddyIds([]);
      setGuestEnabled(false);
      setGuestName("");
      setGuestEmail("");
      setGuestCompany("");
      setAdvancedOpen(false);
    }
  }, [isOpen, prefill, todayStr]);

  // Auto-select first available desk when no prefill
  useEffect(() => {
    if (isOpen && !prefill?.resourceId && resourceType === "desk" && !resourceId && firstAvailableDesk) {
      setResourceId(firstAvailableDesk.id);
    }
  }, [isOpen, prefill?.resourceId, resourceType, resourceId, firstAvailableDesk]);

  const handleStartTimeChange = useCallback((val: string) => {
    setStartTime(val);
    setEndTime(addOneHour(val));
  }, []);

  const toggleDay = useCallback((day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  const toggleBuddy = useCallback((userId: string) => {
    setSelectedBuddyIds((prev) => {
      if (prev.includes(userId)) return prev.filter((id) => id !== userId);
      if (prev.length >= 5) return prev;
      return [...prev, userId];
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!resourceId) newErrors.resource = "Please select a resource";
    if (endTime <= startTime) newErrors.endTime = "End time must be after start";
    if (
      repeatEnabled &&
      (frequency === "weekly" || frequency === "biweekly") &&
      selectedDays.length === 0
    ) {
      newErrors.days = "Select at least one day";
    }

    // Guest validation
    if (guestEnabled) {
      if (!guestName.trim()) newErrors.guestName = "Visitor name is required";
      if (!guestEmail.trim()) newErrors.guestEmail = "Visitor email is required";
    }

    // Buddy validation
    if (buddyEnabled && selectedBuddyIds.length > 0 && resourceType === "desk") {
      const selectedDesk = desks.find((d) => d.id === resourceId);
      if (selectedDesk) {
        const nearbyDesks = findNearbyDesks(
          desks, bookings, selectedDesk.zoneId, selectedDesk.floorId,
          selectedBuddyIds.length, date, startTime, endTime
        );
        if (nearbyDesks.length < selectedBuddyIds.length) {
          newErrors.buddy = `Only ${nearbyDesks.length} nearby desks available, need ${selectedBuddyIds.length}`;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    const label =
      resourceType === "desk"
        ? desks.find((d) => d.id === resourceId)?.label
        : rooms.find((r) => r.id === resourceId)?.name;

    const guestInfoPayload = guestEnabled
      ? { name: guestName.trim(), email: guestEmail.trim(), company: guestCompany.trim() || undefined }
      : undefined;

    // Buddy booking
    if (buddyEnabled && selectedBuddyIds.length > 0 && resourceType === "desk") {
      const selectedDesk = desks.find((d) => d.id === resourceId)!;
      const nearbyDesks = findNearbyDesks(
        desks, bookings, selectedDesk.zoneId, selectedDesk.floorId,
        selectedBuddyIds.length, date, startTime, endTime
      );
      const buddyGroupId = `buddy-${Date.now()}`;

      createBooking({
        resourceType, resourceId, userId: currentUser.id,
        date, startTime, endTime,
        notes: notes.trim() || undefined,
        buddyGroupId,
        guestInfo: guestInfoPayload,
      });

      selectedBuddyIds.forEach((buddyId, i) => {
        createBooking({
          resourceType: "desk",
          resourceId: nearbyDesks[i].id,
          userId: buddyId,
          date, startTime, endTime,
          buddyGroupId,
        });
      });

      const totalCount = selectedBuddyIds.length + 1;
      toast.success(
        `${totalCount} desks booked for you and ${selectedBuddyIds.length} teammate${selectedBuddyIds.length > 1 ? "s" : ""}`,
        { description: "Scan QR code on arrival to check in", duration: 5000 }
      );
    } else if (!repeatEnabled) {
      createBooking({
        resourceType, resourceId, userId: currentUser.id,
        date, startTime, endTime,
        notes: notes.trim() || undefined,
        guestInfo: guestInfoPayload,
      });
      toast.success(
        `${label ?? "Resource"} booked for ${date} ${startTime}–${endTime}`,
        { description: guestEnabled ? "Visitor badge ready" : "Scan QR code on arrival to check in", duration: 5000 }
      );
    } else {
      const dates = generateRecurringDates(date, frequency, selectedDays, occurrences);
      const groupId = `rec-${Date.now()}`;
      for (const d of dates) {
        createBooking({
          resourceType, resourceId, userId: currentUser.id,
          date: d, startTime, endTime,
          notes: notes.trim() || undefined,
          isRecurring: true, recurringGroupId: groupId,
          guestInfo: guestInfoPayload,
        });
      }
      toast.success(
        `Created ${dates.length} recurring bookings for ${label ?? "Resource"}`,
        { description: "Scan QR code on arrival to check in", duration: 5000 }
      );
    }

    // Show visitor badge if guest booking
    if (guestEnabled && guestInfoPayload) {
      setLastGuestInfo(guestInfoPayload);
      setLastBookingDate(date);
      onClose();
      setTimeout(() => setBadgeOpen(true), 300);
    } else {
      onClose();
    }
  }, [
    resourceId, startTime, endTime, resourceType, date, notes,
    currentUser.id, createBooking, desks, rooms, bookings, onClose,
    repeatEnabled, frequency, selectedDays, occurrences,
    buddyEnabled, selectedBuddyIds,
    guestEnabled, guestName, guestEmail, guestCompany,
  ]);

  const formContent = (
    <>
        <div className="space-y-4 py-2">
          {/* Date */}
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 font-normal"
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(date + "T12:00:00"), "EEEE, MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(date + "T12:00:00")}
                  onSelect={(d) => d && setDate(format(d, "yyyy-MM-dd"))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start time</Label>
              <Select value={startTime} onValueChange={handleStartTimeChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>End time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.filter((t) => t > startTime)
                    .concat(["20:00"])
                    .map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.endTime && (
                <p className="text-xs text-destructive">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Advanced options — collapsed by default */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex w-full items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-0" : "-rotate-90"}`} />
              Advanced options
            </button>

            {advancedOpen && (
              <div className="space-y-4 rounded-lg border border-border p-3 mt-1">
                {/* Repeat toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Repeat</Label>
                    <Switch
                      checked={repeatEnabled}
                      onCheckedChange={(checked) => {
                        setRepeatEnabled(checked);
                        if (!checked) {
                          setFrequency("weekly");
                          setOccurrences(4);
                        }
                      }}
                    />
                  </div>

                  {repeatEnabled && (
                    <div className="space-y-3 rounded-lg border border-border p-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Frequency</Label>
                        <Select
                          value={frequency}
                          onValueChange={(v) => setFrequency(v as Frequency)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(frequency === "weekly" || frequency === "biweekly") && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Days</Label>
                          <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map((d) => (
                              <label
                                key={d.value}
                                className="flex items-center gap-1.5 text-sm"
                              >
                                <Checkbox
                                  checked={selectedDays.includes(d.value)}
                                  onCheckedChange={() => toggleDay(d.value)}
                                />
                                {d.label}
                              </label>
                            ))}
                          </div>
                          {errors.days && (
                            <p className="text-xs text-destructive">{errors.days}</p>
                          )}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label className="text-xs">Occurrences</Label>
                        <Select
                          value={String(occurrences)}
                          onValueChange={(v) => setOccurrences(Number(v))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                {n} {n === 1 ? "time" : "times"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Buddy booking */}
                {resourceType === "desk" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Book with teammates
                      </Label>
                      <Switch
                        checked={buddyEnabled}
                        onCheckedChange={(checked) => {
                          setBuddyEnabled(checked);
                          if (!checked) setSelectedBuddyIds([]);
                        }}
                      />
                    </div>

                    {buddyEnabled && (
                      <div className="space-y-2 rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">
                          {selectedBuddyIds.length} teammate{selectedBuddyIds.length !== 1 ? "s" : ""} selected
                        </p>
                        <div className="max-h-32 space-y-1 overflow-y-auto">
                          {teammates.map((t) => {
                            const isSelected = selectedBuddyIds.includes(t.id);
                            const atMax = selectedBuddyIds.length >= 5 && !isSelected;
                            return (
                              <label
                                key={t.id}
                                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent/50 ${atMax ? "opacity-50" : ""}`}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  disabled={atMax}
                                  onCheckedChange={() => toggleBuddy(t.id)}
                                />
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={t.avatar} alt={t.name} />
                                  <AvatarFallback className="text-[8px]">
                                    {t.name.split(" ").map((n) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">{t.name}</span>
                              </label>
                            );
                          })}
                        </div>
                        {selectedBuddyIds.length >= 5 && (
                          <p className="text-xs text-chart-4">Maximum 5 teammates per buddy booking</p>
                        )}
                        {errors.buddy && (
                          <p className="text-xs text-destructive">{errors.buddy}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Guest booking */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5" />
                      Book for a visitor
                    </Label>
                    <Switch
                      checked={guestEnabled}
                      onCheckedChange={(checked) => {
                        setGuestEnabled(checked);
                        if (!checked) {
                          setGuestName("");
                          setGuestEmail("");
                          setGuestCompany("");
                        }
                      }}
                    />
                  </div>

                  {guestEnabled && (
                    <div className="space-y-3 rounded-lg border border-border p-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Visitor name</Label>
                        <Input
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="John Smith"
                        />
                        {errors.guestName && (
                          <p className="text-xs text-destructive">{errors.guestName}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Visitor email</Label>
                        <Input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="john@company.com"
                        />
                        {errors.guestEmail && (
                          <p className="text-xs text-destructive">{errors.guestEmail}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Company (optional)</Label>
                        <Input
                          value={guestCompany}
                          onChange={(e) => setGuestCompany(e.target.value)}
                          placeholder="Acme Inc."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements..."
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
    </>
  );

  return (
    <>
    {isMobile ? (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto px-4 pb-6" data-testid="booking-dialog">
          <DrawerHeader className="px-0">
            <DrawerTitle>New booking</DrawerTitle>
          </DrawerHeader>
          {formContent}
          <DrawerFooter className="flex-row gap-2 px-0">
            <Button variant="outline" className="flex-1" onClick={onClose} data-testid="booking-cancel">Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={submitting} data-testid="booking-submit">
              {submitting ? "Booking..." : guestEnabled ? "Book for visitor" : "Book"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    ) : (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-testid="booking-dialog">
          <DialogHeader>
            <DialogTitle>New booking</DialogTitle>
          </DialogHeader>
          {formContent}
          <DialogFooter>
            <Button variant="outline" onClick={onClose} data-testid="booking-cancel">Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting} data-testid="booking-submit">
              {submitting ? "Booking..." : guestEnabled ? "Book for visitor" : "Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}

    {/* Visitor badge modal */}
    {lastGuestInfo && (
      <VisitorBadge
        isOpen={badgeOpen}
        onClose={() => {
          setBadgeOpen(false);
          setLastGuestInfo(null);
        }}
        guestInfo={lastGuestInfo}
        hostName={currentUser.name}
        date={lastBookingDate}
        resourceId={resourceId}
      />
    )}
    </>
  );
}
