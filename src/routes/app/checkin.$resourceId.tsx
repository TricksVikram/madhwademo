import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { CheckCircle2, AlertTriangle, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useDemoRole } from "../../contexts/DemoRoleContext";
import { useMockData } from "../../contexts/MockDataContext";
import { getFloorById, getZoneById } from "../../data/helpers";
import { QRCode } from "../../components/app/checkin/QRCode";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export const Route = createFileRoute("/app/checkin/$resourceId")({
  component: CheckInPage,
});

function CheckInPage() {
  const { resourceId } = Route.useParams();
  const { currentUser } = useDemoRole();
  const { desks, rooms, floors, zones, bookings, checkInBooking } = useMockData();
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  // Find resource
  const desk = desks.find((d) => d.id === resourceId);
  const room = rooms.find((r) => r.id === resourceId);
  const resource = desk ?? room;
  const resourceType = desk ? "desk" : room ? "room" : null;
  const resourceLabel = desk?.label ?? room?.name;

  if (!resource || !resourceType) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6 space-y-4">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground">Resource not found</h2>
            <p className="text-sm text-muted-foreground">
              The QR code doesn't match any known desk or room.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const floor = getFloorById(floors, resource.floorId);
  const zone = desk ? getZoneById(zones, desk.zoneId) : undefined;

  // Find active booking for current user on this resource today
  const today = format(new Date(), "yyyy-MM-dd");
  const activeBooking = bookings.find(
    (b) =>
      b.resourceId === resourceId &&
      b.userId === currentUser.id &&
      b.date === today &&
      (b.status === "upcoming" || b.status === "checked-in")
  );

  const isAlreadyCheckedIn = activeBooking?.status === "checked-in" || justCheckedIn;

  const handleCheckIn = () => {
    if (!activeBooking) return;
    checkInBooking(activeBooking.id);
    setJustCheckedIn(true);
    toast.success(`Checked in to ${resourceLabel}`, {
      icon: <CheckCircle2 className="h-4 w-4 text-chart-2" />,
    });
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3">
            <QRCode resourceId={resourceId} size={100} />
          </div>
          <CardTitle className="text-xl">{resourceLabel}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {floor?.name}
            {zone ? ` · ${zone.name}` : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAlreadyCheckedIn ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/10 animate-in zoom-in-50">
                <CheckCircle2 className="h-8 w-8 text-chart-2" />
              </div>
              <p className="text-lg font-semibold text-chart-2">Already checked in</p>
              {activeBooking && (
                <p className="text-sm text-muted-foreground">
                  {activeBooking.startTime} – {activeBooking.endTime}
                </p>
              )}
            </div>
          ) : activeBooking ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <QrCode className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">
                Booking: {activeBooking.startTime} – {activeBooking.endTime}
              </p>
              <Button size="lg" className="w-full" onClick={handleCheckIn}>
                Check in
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No active booking</p>
              <p className="text-xs text-muted-foreground text-center">
                You don't have a booking for this {resourceType} today.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
