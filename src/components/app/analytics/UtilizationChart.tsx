import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { generateDailyUtilization, type DateRange } from "../../../data/analytics-helpers";

interface Props {
  range: DateRange;
}

export function UtilizationChart({ range }: Props) {
  const data = useMemo(() => generateDailyUtilization(range, 30), [range]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Desk utilization over time</CardTitle>
        <p className="text-xs text-muted-foreground">Daily average utilization percentage</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} unit="%" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value}%`, "Utilization"]}
              />
              <Area
                type="monotone"
                dataKey="utilization"
                stroke="var(--color-primary)"
                fill="url(#utilGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
