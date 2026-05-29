import { useState } from "react";
import { toast } from "sonner";
import { useAdminData, type BookingRules as BookingRulesType } from "../../../contexts/AdminDataContext";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Calendar } from "../../ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

const DURATION_OPTIONS = [
  { value: "1", label: "1 hour" },
  { value: "2", label: "2 hours" },
  { value: "4", label: "4 hours" },
  { value: "8", label: "8 hours (full day)" },
];

const GRACE_OPTIONS = [
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
];

export function BookingRules() {
  const { bookingRules, setBookingRules } = useAdminData();

  const [maxDuration, setMaxDuration] = useState(String(bookingRules.maxDurationHours));
  const [advanceDays, setAdvanceDays] = useState(bookingRules.advanceBookingDays);
  const [gracePeriod, setGracePeriod] = useState(String(bookingRules.gracePeriodMinutes));
  const [autoRelease, setAutoRelease] = useState(bookingRules.autoReleaseEnabled);
  const [blackoutDates, setBlackoutDates] = useState<Date[]>(
    bookingRules.blackoutDates.map((d) => new Date(d + "T12:00:00"))
  );

  const handleSave = () => {
    const rules: BookingRulesType = {
      maxDurationHours: Number(maxDuration),
      advanceBookingDays: advanceDays,
      gracePeriodMinutes: Number(gracePeriod),
      autoReleaseEnabled: autoRelease,
      blackoutDates: blackoutDates.map((d) => d.toISOString().slice(0, 10)),
    };
    setBookingRules(rules);
    toast.success("Booking rules saved");
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader><CardTitle className="text-base">Duration & limits</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Max booking duration</Label>
            <Select value={maxDuration} onValueChange={setMaxDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Advance booking limit (days)</Label>
            <Input type="number" min={1} max={90} value={advanceDays} onChange={(e) => setAdvanceDays(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Check-in & auto-release</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Check-in grace period</Label>
            <Select value={gracePeriod} onValueChange={setGracePeriod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GRACE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-release enabled</Label>
            <Switch checked={autoRelease} onCheckedChange={setAutoRelease} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Blackout dates</CardTitle></CardHeader>
        <CardContent>
          <Calendar
            mode="multiple"
            selected={blackoutDates}
            onSelect={(dates) => setBlackoutDates(dates ?? [])}
            className="rounded-md border"
          />
          {blackoutDates.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {blackoutDates.length} date{blackoutDates.length !== 1 ? "s" : ""} blocked
            </p>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">Save rules</Button>
    </div>
  );
}
