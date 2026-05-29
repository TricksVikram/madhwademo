import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Car, Lock, CalendarIcon } from "lucide-react";
import { useMockData } from "../../../contexts/MockDataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { BookingDialog } from "../booking/BookingDialog";
import { useBookingDialog } from "../booking/useBookingDialog";
import type { ResourceType } from "../../../data/types";

export function ResourcesPage() {
  const { parkingSpots, lockers, bookings } = useMockData();
  const bookingDialog = useBookingDialog();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(todayStr);

  const bookedIds = useMemo(() => {
    return new Set(
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
  }, [bookings, date]);

  const handleBook = (resourceId: string, resourceType: ResourceType) => {
    bookingDialog.open({ date, resourceType, resourceId });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4" data-testid="page-resources">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Parking & lockers</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 font-normal">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              {format(new Date(date + "T12:00:00"), "EEE, MMM d")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={new Date(date + "T12:00:00")}
              onSelect={(d) => d && setDate(format(d, "yyyy-MM-dd"))}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="parking">
        <TabsList>
          <TabsTrigger value="parking" className="gap-1.5">
            <Car className="h-3.5 w-3.5" />
            Parking
          </TabsTrigger>
          <TabsTrigger value="lockers" className="gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Lockers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parking" className="mt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {parkingSpots.map((spot) => {
              const booked = bookedIds.has(spot.id);
              const isMaint = spot.status === "maintenance";
              return (
                <div
                  key={spot.id}
                  className="flex flex-col gap-3 rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{spot.label}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        isMaint
                          ? "bg-muted text-muted-foreground"
                          : booked
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-chart-2/10 text-chart-2 border-chart-2/20"
                      }
                    >
                      {isMaint ? "Maintenance" : booked ? "Booked" : "Available"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{spot.location}</p>
                  {!booked && !isMaint && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBook(spot.id, "parking")}
                    >
                      Book
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="lockers" className="mt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lockers.map((locker) => {
              const booked = bookedIds.has(locker.id);
              return (
                <div
                  key={locker.id}
                  className="flex flex-col gap-3 rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{locker.label}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        booked
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-chart-2/10 text-chart-2 border-chart-2/20"
                      }
                    >
                      {booked ? "Booked" : "Available"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {locker.size.charAt(0).toUpperCase() + locker.size.slice(1)} · {locker.location}
                  </p>
                  {!booked && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBook(locker.id, "locker")}
                    >
                      Book
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <BookingDialog
        isOpen={bookingDialog.isOpen}
        onClose={bookingDialog.close}
        prefill={bookingDialog.prefill}
      />
    </div>
  );
}
