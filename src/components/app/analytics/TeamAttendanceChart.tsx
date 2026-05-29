import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { generateTeamAttendance, type DateRange } from "../../../data/analytics-helpers";
import type { Team } from "../../../data/types";

const TEAM_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-4)",
];

interface Props {
  range: DateRange;
  teams: Team[];
}

export function TeamAttendanceChart({ range, teams }: Props) {
  const data = useMemo(() => generateTeamAttendance(range, teams), [range, teams]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Team attendance</CardTitle>
        <p className="text-xs text-muted-foreground">In-office headcount by team per day</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              {teams.map((t, i) => (
                <Bar
                  key={t.id}
                  dataKey={t.name}
                  stackId="a"
                  fill={TEAM_COLORS[i % TEAM_COLORS.length]}
                  radius={i === teams.length - 1 ? [4, 4, 0, 0] : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
