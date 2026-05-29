import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../ui/button";
import { WizardStepWhen } from "./WizardStepWhen";
import { WizardStepWhere } from "./WizardStepWhere";
import { WizardStepConfirm } from "./WizardStepConfirm";
import { BookingSuccess } from "./BookingSuccess";
import type { Booking } from "../../../../data/types";

export interface WizardState {
  date: string;
  startTime: string;
  endTime: string;
  floorId: string;
  resourceType: "desk" | "room";
  resourceId: string | null;
  resourceLabel: string | null;
  floorName: string | null;
  zoneName: string | null;
  roomCapacity?: number;
  roomAmenities?: string[];
}

export interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-fill for "book again" or "modify" flows */
  prefill?: Partial<WizardState>;
  /** Start on step 2 when coming from floor map */
  initialStep?: number;
}

const STEPS = ["When", "Where", "Confirm"] as const;

export function BookingWizard({ isOpen, onClose, prefill, initialStep = 0 }: BookingWizardProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [step, setStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  const [wizard, setWizard] = useState<WizardState>({
    date: prefill?.date ?? today,
    startTime: prefill?.startTime ?? "09:00",
    endTime: prefill?.endTime ?? "17:00",
    floorId: prefill?.floorId ?? "",
    resourceType: prefill?.resourceType ?? "desk",
    resourceId: prefill?.resourceId ?? null,
    resourceLabel: prefill?.resourceLabel ?? null,
    floorName: prefill?.floorName ?? null,
    zoneName: prefill?.zoneName ?? null,
    roomCapacity: prefill?.roomCapacity,
    roomAmenities: prefill?.roomAmenities,
  });

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 2));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleSuccess = useCallback((booking: Booking) => {
    setCompletedBooking(booking);
  }, []);

  const handleClose = useCallback(() => {
    setStep(initialStep);
    setCompletedBooking(null);
    setWizard({
      date: prefill?.date ?? today,
      startTime: prefill?.startTime ?? "09:00",
      endTime: prefill?.endTime ?? "17:00",
      floorId: prefill?.floorId ?? "",
      resourceType: prefill?.resourceType ?? "desk",
      resourceId: prefill?.resourceId ?? null,
      resourceLabel: prefill?.resourceLabel ?? null,
      floorName: prefill?.floorName ?? null,
      zoneName: prefill?.zoneName ?? null,
      roomCapacity: prefill?.roomCapacity,
      roomAmenities: prefill?.roomAmenities,
    });
    onClose();
  }, [onClose, initialStep, prefill, today]);

  const handleBookAnother = useCallback(() => {
    setCompletedBooking(null);
    setStep(0);
    setWizard((w) => ({ ...w, resourceId: null, resourceLabel: null, floorName: null, zoneName: null, roomCapacity: undefined, roomAmenities: undefined }));
  }, []);

  if (!isOpen) return null;

  // Success screen
  if (completedBooking) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-end p-4">
            <button onClick={handleClose} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-4">
            <BookingSuccess booking={completedBooking} onClose={handleClose} onBookAnother={handleBookAnother} />
          </div>
        </div>
      </div>
    );
  }

  const canProceedStep0 = wizard.date && wizard.startTime && wizard.endTime && wizard.startTime < wizard.endTime;
  const canProceedStep1 = wizard.resourceId !== null;

  return (
    <div className="fixed inset-0 z-50 bg-background" data-testid="booking-wizard">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button onClick={goBack} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-foreground">{wizard.resourceType === "room" ? "Reserve a room" : "Book a desk"}</h2>
              <p className="text-xs text-muted-foreground">
                Step {step + 1} of {STEPS.length} · {STEPS[step]}
              </p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    i < step ? "bg-primary text-primary-foreground" :
                    i === step ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                  {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>
            <button onClick={handleClose} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" data-testid="wizard-close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              {step === 0 && (
                <WizardStepWhen wizard={wizard} setWizard={setWizard} onNext={goNext} />
              )}
              {step === 1 && (
                <WizardStepWhere wizard={wizard} setWizard={setWizard} onNext={goNext} onBack={goBack} />
              )}
              {step === 2 && (
                <WizardStepConfirm wizard={wizard} onBack={goBack} onSuccess={handleSuccess} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with navigation */}
        {step === 0 && (
          <div className="border-t border-border px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-2xl items-center justify-between">
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button onClick={goNext} disabled={!canProceedStep0} className="gap-1.5" data-testid="wizard-next-step-1">
                {wizard.resourceType === "room" ? "Pick a room" : "Pick a seat"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="border-t border-border px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <Button variant="ghost" onClick={goBack} className="gap-1.5">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                {wizard.resourceLabel && (
                  <span className="text-sm text-muted-foreground">
                    {wizard.resourceLabel}{wizard.zoneName ? ` · ${wizard.zoneName}` : ""}
                  </span>
                )}
                <Button onClick={goNext} disabled={!canProceedStep1} className="gap-1.5" data-testid="wizard-next-step-2">
                  Review booking
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
