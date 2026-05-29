import { useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { useMockData } from "../../../contexts/MockDataContext";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import type { User } from "../../../data/types";

interface WeeklyAttendanceProps {
  users: User[];
  selectedTeamId: string;
}

export function WeeklyAttendance({ users, selectedTeamId }: WeeklyAttendanceProps) {
  const { bookings } = useMockData();

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const weekDays = useMemo(() => {
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, i) => {
      const date = addDays(monday, i);
      return {
        date: format(date, "yyyy-MM-dd"),
        label: format(date, "EEE"),
        short: format(date, "d"),
        isToday: format(date, "yyyy-MM-dd") === todayStr,
      };
    });
  }, [todayStr]);

  // Build lookup: userId+date -> has booking
  const attendanceMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const b of bookings) {
      if (
        b.resourceType === "desk" &&
        b.status !== "cancelled" &&
        b.status !== "auto-released"
      ) {
        map.set(`${b.userId}:${b.date}`, true);
      }
    }
    return map;
  }, [bookings]);

  const dayPercentages = useMemo(() => {
    if (users.length === 0) return weekDays.map(() => 0);
    return weekDays.map((day) => {
      const count = users.filter((u) =>
        attendanceMap.has(`${u.id}:${day.date}`)
      ).length;
      return Math.round((count / users.length) * 100);
    });
  }, [weekDays, users, attendanceMap]);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">Weekly attendance</h2>
      <ScrollArea className="w-full">
        <div className="min-w-[500px]">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="py-2 pr-4 text-left font-medium text-muted-foreground w-32">
                  Member
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.date}
                    className={`py-2 px-3 text-center font-medium ${
                      day.isToday
                        ? "bg-primary/5 text-primary rounded-t-md"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div>{day.label}</div>
                    <div className="text-[10px]">{day.short}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border/50">
                  <td className="py-2 pr-4 text-foreground font-medium truncate max-w-[120px]">
                    {user.name}
                  </td>
                  {weekDays.map((day) => {
                    const hasBooking = attendanceMap.has(
                      `${user.id}:${day.date}`
                    );
                    return (
                      <td
                        key={day.date}
                        className={`py-2 px-3 text-center ${
                          day.isToday ? "bg-primary/5" : ""
                        }`}
                      >
                        <div
                          className={`mx-auto h-2.5 w-2.5 rounded-full ${
                            hasBooking
                              ? "bg-chart-2"
                              : "bg-muted-foreground/20"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t border-border">
                <td className="py-2 pr-4 text-muted-foreground font-medium">
                  Attendance
                </td>
                {weekDays.map((day, i) => (
                  <td
                    key={day.date}
                    className={`py-2 px-3 text-center font-semibold ${
                      day.isToday
                        ? "bg-primary/5 text-primary rounded-b-md"
                        : "text-muted-foreground"
                    }`}
                  >
                    {dayPercentages[i]}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
