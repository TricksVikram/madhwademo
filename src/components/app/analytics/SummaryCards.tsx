import { useMemo } from "react";
import { BarChart3, CalendarCheck, Clock, Building2 } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { generateSummaryStats, type DateRange } from "../../../data/analytics-helpers";
import type { Floor } from "../../../data/types";
import type { LucideIcon } from "lucide-react";

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface Props {
  range: DateRange;
  floors: Floor[];
}

export function SummaryCards({ range, floors }: Props) {
  const stats = useMemo(() => generateSummaryStats(range, floors), [range, floors]);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard icon={BarChart3} label="Average utilization" value={`${stats.avgUtilization}%`} />
      <StatCard icon={CalendarCheck} label="Total bookings" value={String(stats.totalBookings)} />
      <StatCard icon={Clock} label="Peak hour" value={stats.peakHour} />
      <StatCard icon={Building2} label="Most popular floor" value={stats.popularFloor} />
    </div>
  );
}
