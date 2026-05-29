import {
  CalendarCheck,
  LogIn,
  XCircle,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMockData } from "../../../contexts/MockDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import type { NotificationType } from "../../../data/types";
import type { LucideIcon } from "lucide-react";

const typeIcons: Record<NotificationType, LucideIcon> = {
  booking_confirmed: CalendarCheck,
  checkin_reminder: LogIn,
  waitlist_bump: Bell,
  auto_release: AlertTriangle,
  general: Bell,
};

const typeColors: Record<NotificationType, string> = {
  booking_confirmed: "text-primary",
  checkin_reminder: "text-chart-4",
  waitlist_bump: "text-chart-2",
  auto_release: "text-destructive",
  general: "text-muted-foreground",
};

export function ActivityFeed() {
  const { notifications } = useMockData();
  const recent = notifications.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {recent.map((notif) => {
              const Icon = typeIcons[notif.type];
              const color = typeColors[notif.type];
              return (
                <div key={notif.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {notif.message}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
