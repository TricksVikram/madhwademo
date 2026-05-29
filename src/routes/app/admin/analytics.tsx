import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, ShieldAlert } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useMockData } from "../../../contexts/MockDataContext";
import { generateExportCSV, type DateRange } from "../../../data/analytics-helpers";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { SummaryCards } from "../../../components/app/analytics/SummaryCards";
import { UtilizationChart } from "../../../components/app/analytics/UtilizationChart";
import { OccupancyByFloorChart } from "../../../components/app/analytics/OccupancyByFloorChart";
import { PeakHoursChart } from "../../../components/app/analytics/PeakHoursChart";
import { ResourceBreakdownChart } from "../../../components/app/analytics/ResourceBreakdownChart";
import { TeamAttendanceChart } from "../../../components/app/analytics/TeamAttendanceChart";
import { DeskHeatmap } from "../../../components/app/analytics/DeskHeatmap";

export const Route = createFileRoute("/app/admin/analytics")({
  component: AnalyticsPage,
});

const RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "last_30", label: "Last 30 days" },
];

function AnalyticsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const { floors, desks, teams } = useMockData();
  const [range, setRange] = useState<DateRange>("this_week");

  const handleExport = useCallback(() => {
    const csv = generateExportCSV(range, floors, desks.length);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deskflow-analytics-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [range, floors, desks.length]);

  if (role === "user") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center" data-testid="admin-access-denied">
        <ShieldAlert className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold text-foreground">Access denied</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You need admin privileges to view this page
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6" data-testid="page-analytics">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <SummaryCards range={range} floors={floors} />

      <div className="grid gap-4 lg:grid-cols-2">
        <UtilizationChart range={range} />
        <OccupancyByFloorChart range={range} floors={floors} />
        <PeakHoursChart range={range} />
        <ResourceBreakdownChart range={range} />
        <TeamAttendanceChart range={range} teams={teams} />
      </div>

      <DeskHeatmap range={range} />
    </div>
  );
}
