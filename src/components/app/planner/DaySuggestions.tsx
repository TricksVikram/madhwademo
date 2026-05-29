import { useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { Lightbulb, CheckCircle2 } from "lucide-react";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useMockData } from "../../../contexts/MockDataContext";

interface DaySuggestionsProps {
  weekDays: { date: string; label: string }[];
  plannedDays: Set<string>;
}

export function DaySuggestions({ weekDays, plannedDays }: DaySuggestionsProps) {
  const { currentUser } = useDemoRole();
  const { bookings, users } = useMockData();

  const currentMockUser = users.find((u) => u.id === currentUser.id);

  const teammates = useMemo(
    () => users.filter((u) => u.id !== currentUser.id && u.teamId === currentMockUser?.teamId),
    [users, currentUser.id, currentMockUser?.teamId]
  );

  // Find top 2 days by teammate attendance
  const topDays = useMemo(() => {
    const dayCounts = weekDays.map((day) => {
      const count = teammates.filter((t) =>
        bookings.some(
          (b) =>
            b.userId === t.id &&
            b.date === day.date &&
            b.resourceType === "desk" &&
            b.status !== "cancelled" &&
            b.status !== "auto-released"
        )
      ).length;
      return { ...day, count };
    });
    return dayCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)
      .filter((d) => d.count > 0);
  }, [weekDays, teammates, bookings]);

  if (topDays.length === 0) {
    return null;
  }

  const topDayDates = new Set(topDays.map((d) => d.date));
  const isAligned = topDays.every((d) => plannedDays.has(d.date));
  const dayNames = topDays.map((d) => d.label).join(" and ");

  if (isAligned) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-chart-2/5 border border-chart-2/20 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-chart-2" />
        <p className="text-sm text-chart-2 font-medium">
          You're aligned with your team this week
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
      <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
      <p className="text-sm text-foreground">
        Most of your team is in on <span className="font-semibold">{dayNames}</span> — consider booking those days
      </p>
    </div>
  );
}
