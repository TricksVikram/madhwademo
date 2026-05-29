import { useState, useMemo, useCallback } from "react";
import { format, startOfWeek, endOfWeek, endOfMonth } from "date-fns";
import { CalendarX, Clock, ListOrdered, Monitor, DoorOpen } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../EmptyState";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { BookingListSkeleton } from "../skeletons/BookingListSkeleton";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useMockData } from "../../../contexts/MockDataContext";
import { getBookingsForUser, getFloorById, getZoneById } from "../../../data/helpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { BookingCard } from "./BookingCard";
import { BookingWizard } from "../booking/wizard/BookingWizard";
import type { WizardState } from "../booking/wizard/BookingWizard";

type DateFilter = "week" | "month" | "all";
type TypeFilter = "all" | "desk" | "room" | "parking" | "locker" | "guest";

export function MyBookingsPage() {
  const { currentUser } = useDemoRole();
  const { bookings, waitlist, leaveWaitlist, desks, rooms, floors, zones } = useMockData();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardPrefill, setWizardPrefill] = useState<Partial<WizardState> | undefined>();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const userBookings = useMemo(
    () => getBookingsForUser(bookings, currentUser.id),
    [bookings, currentUser.id]
  );

  const userWaitlist = useMemo(
    () => waitlist.filter((w) => w.userId === currentUser.id),
    [waitlist, currentUser.id]
  );

  const totalWaitlistForResource = useCallback(
    (resourceId: string, date: string) =>
      waitlist.filter((w) => w.resourceId === resourceId && w.date === date).length,
    [waitlist]
  );

  const applyTypeFilter = useCallback(
    (list: typeof userBookings) => {
      if (typeFilter === "guest") return list.filter((b) => b.guestInfo);
      if (typeFilter !== "all") return list.filter((b) => b.resourceType === typeFilter);
      return list;
    },
    [typeFilter]
  );

  const upcomingBookings = useMemo(() => {
    let result = userBookings
      .filter((b) => b.status === "upcoming" || b.status === "checked-in")
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

    result = applyTypeFilter(result);

    if (dateFilter === "week") {
      const now = new Date();
      const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
      result = result.filter((b) => b.date >= weekStart && b.date <= weekEnd);
    } else if (dateFilter === "month") {
      const now = new Date();
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
      const monthStart = format(now, "yyyy-MM-01");
      result = result.filter((b) => b.date >= monthStart && b.date <= monthEnd);
    }

    return result;
  }, [userBookings, typeFilter, dateFilter, applyTypeFilter]);

  const pastBookings = useMemo(() => {
    let result = userBookings
      .filter(
        (b) =>
          b.status === "completed" ||
          b.status === "cancelled" ||
          b.status === "auto-released"
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));

    result = applyTypeFilter(result);

    return result;
  }, [userBookings, typeFilter, applyTypeFilter]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setTypeFilter("all");
    setDateFilter("all");
  }, []);

  const handleLeaveWaitlist = (entryId: string) => {
    leaveWaitlist(entryId);
    toast.success("Removed from waitlist");
  };

  const handleModify = useCallback((booking: typeof userBookings[0]) => {
    const desk = desks.find((d) => d.id === booking.resourceId);
    const floor = desk ? floors.find((f) => f.id === desk.floorId) : undefined;
    const zone = desk ? zones.find((z) => z.id === (desk as any).zoneId) : undefined;
    setWizardPrefill({
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      resourceId: booking.resourceId,
      resourceLabel: desk?.label || booking.resourceId,
      floorName: floor?.name || null,
      zoneName: zone?.name || null,
    });
    setWizardOpen(true);
  }, [desks, floors, zones]);

  const handleBookAgain = useCallback((booking: typeof userBookings[0]) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const desk = desks.find((d) => d.id === booking.resourceId);
    const floor = desk ? floors.find((f) => f.id === desk.floorId) : undefined;
    const zone = desk ? zones.find((z) => z.id === (desk as any).zoneId) : undefined;
    setWizardPrefill({
      date: todayStr,
      resourceId: booking.resourceId,
      resourceLabel: desk?.label || booking.resourceId,
      floorName: floor?.name || null,
      zoneName: zone?.name || null,
    });
    setWizardOpen(true);
  }, [desks, floors, zones]);

  const typeButtons: { value: TypeFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "desk", label: "Desks" },
    { value: "room", label: "Rooms" },
    { value: "parking", label: "Parking" },
    { value: "locker", label: "Lockers" },
    { value: "guest", label: "Guest bookings" },
  ];

  const dateButtons: { value: DateFilter; label: string }[] = [
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "all", label: "All upcoming" },
  ];

  const currentList = activeTab === "upcoming" ? upcomingBookings : pastBookings;
  const isFiltered = typeFilter !== "all" || (activeTab === "upcoming" && dateFilter !== "all");
  const isLoading = useSimulatedLoading(400);

  if (isLoading) return <BookingListSkeleton />;

  return (
    <div className="mx-auto max-w-4xl space-y-4" data-testid="page-my-bookings">
      <h1 className="text-2xl font-bold text-foreground">My bookings</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="waitlist" className="gap-1.5">
            Waitlist
            {userWaitlist.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {userWaitlist.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        {activeTab !== "waitlist" && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
              {typeButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setTypeFilter(btn.value)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    typeFilter === btn.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {activeTab === "upcoming" && (
              <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
                {dateButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setDateFilter(btn.value)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      dateFilter === btn.value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <TabsContent value="upcoming" className="mt-4">
          {currentList.length === 0 ? (
            isFiltered ? (
              <EmptyState
                icon={CalendarX}
                title="No matching bookings"
                description="No bookings match your current filters."
              />
            ) : (
              <EmptyState
                icon={CalendarX}
                title="No upcoming bookings"
                description="Book a desk to get started."
                action={{ label: "Book a desk", onClick: () => { setWizardPrefill(undefined); setWizardOpen(true); } }}
              />
            )
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((b) => (
                <BookingCard key={b.id} booking={b} showActions onModify={handleModify} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {pastBookings.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No past bookings"
              description={isFiltered ? "No bookings match your filters." : "Your completed bookings will appear here."}
            />
          ) : (
            <div className="space-y-3">
              {pastBookings.map((b) => (
                <BookingCard key={b.id} booking={b} onBookAgain={handleBookAgain} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="waitlist" className="mt-4">
          {userWaitlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ListOrdered className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">You're not on any waitlists</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userWaitlist.map((entry) => {
                const label =
                  entry.resourceType === "desk"
                    ? desks.find((d) => d.id === entry.resourceId)?.label
                    : rooms.find((r) => r.id === entry.resourceId)?.name;
                const resource =
                  entry.resourceType === "desk"
                    ? desks.find((d) => d.id === entry.resourceId)
                    : rooms.find((r) => r.id === entry.resourceId);
                const floor = resource ? getFloorById(floors, resource.floorId) : undefined;
                const total = totalWaitlistForResource(entry.resourceId, entry.date);
                const TypeIcon = entry.resourceType === "desk" ? Monitor : DoorOpen;

                return (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-3 rounded-lg border border-l-4 border-l-chart-4 bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {label ?? entry.resourceId}
                          </span>
                          <Badge variant="outline" className="text-[10px] bg-chart-4/10 text-chart-4 border-chart-4/20">
                            Position #{entry.position} of {total}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {floor?.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(entry.date + "T12:00:00"), "EEE, MMM d")} · {entry.startTime} – {entry.endTime}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleLeaveWaitlist(entry.id)}
                    >
                      Leave waitlist
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BookingWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        prefill={wizardPrefill}
      />
    </div>
  );
}
