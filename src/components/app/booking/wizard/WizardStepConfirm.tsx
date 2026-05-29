import { useState, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, DoorOpen, Check, Users } from "lucide-react";
import { Button } from "../../../ui/button";
import { useMockData } from "../../../../contexts/MockDataContext";
import { useDemoRole } from "../../../../contexts/DemoRoleContext";
import type { WizardState } from "./BookingWizard";
import type { Booking } from "../../../../data/types";

interface Props {
  wizard: WizardState;
  onBack: () => void;
  onSuccess: (booking: Booking) => void;
}

export function WizardStepConfirm({ wizard, onBack, onSuccess }: Props) {
  const { createBooking } = useMockData();
  const { currentUser } = useDemoRole();
  const [submitting, setSubmitting] = useState(false);

  const dateLabel = format(new Date(wizard.date + "T12:00:00"), "EEEE, MMMM d, yyyy");
  const isRoom = wizard.resourceType === "room";

  const handleConfirm = useCallback(() => {
    if (!wizard.resourceId) return;
    setSubmitting(true);

    const booking = createBooking({
      resourceType: wizard.resourceType,
      resourceId: wizard.resourceId,
      userId: currentUser.id,
      date: wizard.date,
      startTime: wizard.startTime,
      endTime: wizard.endTime,
    });

    onSuccess(booking);
  }, [wizard, currentUser.id, createBooking, onSuccess]);

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6" data-testid="wizard-step-confirm">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">
            {isRoom ? "Confirm your reservation" : "Confirm your booking"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Review the details before confirming</p>
        </div>

        {/* Summary card */}
        <div className="rounded-xl border-2 border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isRoom ? "bg-blue-500/10" : "bg-primary/10"}`}>
              {isRoom ? (
                <DoorOpen className="h-5 w-5 text-blue-600" />
              ) : (
                <MapPin className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">{wizard.resourceLabel}</p>
              <p className="text-sm text-muted-foreground">
                {wizard.floorName}{wizard.zoneName ? ` · ${wizard.zoneName}` : ""}
              </p>
              {isRoom && wizard.roomCapacity && (
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {wizard.roomCapacity} seats
                </div>
              )}
              {isRoom && wizard.roomAmenities && wizard.roomAmenities.length > 0 && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {wizard.roomAmenities.join(" · ")}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{dateLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{wizard.startTime} – {wizard.endTime}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full text-base font-semibold gap-2"
            onClick={handleConfirm}
            disabled={submitting}
            data-testid="wizard-confirm-booking"
          >
            <Check className="h-5 w-5" />
            {isRoom ? "Confirm reservation" : "Confirm booking"}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={onBack}
          >
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
