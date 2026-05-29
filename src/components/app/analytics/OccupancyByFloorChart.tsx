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
import { generateFloorOccupancy, type DateRange } from "../../../data/analytics-helpers";
import type { Floor } from "../../../data/types";

interface Props {
  range: DateRange;
  floors: Floor[];
}

export function OccupancyByFloorChart({ range, floors }: Props) {
  const data = useMemo(() => generateFloorOccupancy(floors, range), [floors, range]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Occupancy by floor</CardTitle>
        <p className="text-xs text-muted-foreground">Average occupancy rate per floor</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="floor" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
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
              <Bar dataKey="occupancy" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
