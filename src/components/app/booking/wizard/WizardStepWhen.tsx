import { useMemo, useState } from "react";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { CalendarIcon, Sun, CloudSun, Clock } from "lucide-react";
import { Calendar } from "../../../ui/calendar";
import { useMockData } from "../../../../contexts/MockDataContext";
import { getAvailableDesks } from "../../../../data/helpers";
import type { WizardState } from "./BookingWizard";

const TIME_PRESETS = [
  { label: "Morning", start: "09:00", end: "12:00", icon: Sun, description: "9:00 AM – 12:00 PM" },
  { label: "Afternoon", start: "13:00", end: "17:00", icon: CloudSun, description: "1:00 PM – 5:00 PM" },
  { label: "Full day", start: "09:00", end: "17:00", icon: Clock, description: "9:00 AM – 5:00 PM" },
];

function getQuickDateChips(): { label: string; date: string }[] {
  const chips: { label: string; date: string }[] = [];
  const now = new Date();
  chips.push({ label: "Today", date: format(now, "yyyy-MM-dd") });
  chips.push({ label: "Tomorrow", date: format(addDays(now, 1), "yyyy-MM-dd") });
  // Next 3 weekdays
  let d = addDays(now, 2);
  let count = 0;
  while (count < 3) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      chips.push({ label: format(d, "EEE, MMM d"), date: format(d, "yyyy-MM-dd") });
      count++;
    }
    d = addDays(d, 1);
  }
  return chips;
}

interface Props {
  wizard: WizardState;
  setWizard: React.Dispatch<React.SetStateAction<WizardState>>;
  onNext: () => void;
}

export function WizardStepWhen({ wizard, setWizard, onNext }: Props) {
  const [showCalendar, setShowCalendar] = useState(false);
  const { desks, bookings } = useMockData();
  const dateChips = useMemo(() => getQuickDateChips(), []);

  const availableCount = useMemo(() => {
    return getAvailableDesks(desks, bookings, wizard.date, wizard.startTime, wizard.endTime).length;
  }, [desks, bookings, wizard.date, wizard.startTime, wizard.endTime]);

  const selectedPreset = TIME_PRESETS.find(
    (p) => p.start === wizard.startTime && p.end === wizard.endTime
  );

  const handleDateSelect = (date: string) => {
    setWizard((w) => ({ ...w, date, resourceId: null, resourceLabel: null }));
    setShowCalendar(false);
  };

  const handlePreset = (preset: typeof TIME_PRESETS[0]) => {
    setWizard((w) => ({ ...w, startTime: preset.start, endTime: preset.end, resourceId: null, resourceLabel: null }));
  };

  const selectedDateObj = new Date(wizard.date + "T12:00:00");
  const dateLabel = isToday(selectedDateObj) ? "Today" : isTomorrow(selectedDateObj) ? "Tomorrow" : format(selectedDateObj, "EEEE, MMM d");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="space-y-8">
        {/* Date selection */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">When do you need a desk?</h3>
          <div className="flex flex-wrap gap-2">
            {dateChips.map((chip) => (
              <button
                key={chip.date}
                onClick={() => handleDateSelect(chip.date)}
                className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  wizard.date === chip.date
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {chip.label}
              </button>
            ))}
            <button
              onClick={() => setShowCalendar((v) => !v)}
              className={`rounded-lg border border-dashed px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-1.5 ${
                showCalendar
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Other date
            </button>
          </div>

          {/* Expandable calendar */}
          {showCalendar && (
            <div className="flex justify-center pt-2">
              <Calendar
                mode="single"
                selected={selectedDateObj}
                onSelect={(d) => d && handleDateSelect(format(d, "yyyy-MM-dd"))}
                className="pointer-events-auto w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-sm [--cell-size:3rem]"
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
              />
            </div>
          )}
        </div>

        {/* Time selection */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">What time?</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {TIME_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isActive = selectedPreset === preset;
              return (
                <button
                  key={preset.label}
                  onClick={() => handlePreset(preset)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                    {preset.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{preset.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>8:00 AM</span>
            <span>8:00 PM</span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
            {(() => {
              const totalMinutes = 12 * 60; // 8am to 8pm
              const [sh, sm] = wizard.startTime.split(":").map(Number);
              const [eh, em] = wizard.endTime.split(":").map(Number);
              const startOffset = ((sh - 8) * 60 + sm) / totalMinutes * 100;
              const endOffset = ((eh - 8) * 60 + em) / totalMinutes * 100;
              return (
                <div
                  className="absolute top-0 h-full rounded-full bg-primary/80 transition-all duration-300"
                  style={{ left: `${startOffset}%`, width: `${endOffset - startOffset}%` }}
                />
              );
            })()}
          </div>
          <p className="text-center text-sm font-medium text-foreground">
            {dateLabel} · {wizard.startTime} – {wizard.endTime}
          </p>
        </div>

        {/* Availability hint */}
        <div className="flex items-center justify-center rounded-lg bg-muted/50 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className={`font-semibold ${availableCount > 0 ? "text-chart-2" : "text-destructive"}`}>
              {availableCount} desk{availableCount !== 1 ? "s" : ""}
            </span>
            {" "}available for this time
          </p>
        </div>
      </div>
    </div>
  );
}
