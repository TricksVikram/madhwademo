import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { generatePeakHours, type DateRange } from "../../../data/analytics-helpers";

interface Props {
  range: DateRange;
}

export function PeakHoursChart({ range }: Props) {
  const data = useMemo(() => generatePeakHours(range), [range]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Peak hours</CardTitle>
        <p className="text-xs text-muted-foreground">Average occupancy by hour of day</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} unit="%" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value}%`, "Occupancy"]}
              />
              <Bar dataKey="occupancy" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
