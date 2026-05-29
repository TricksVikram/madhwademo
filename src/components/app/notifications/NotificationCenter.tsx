import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CalendarCheck,
  Clock,
  ArrowUp,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useMockData } from "../../../contexts/MockDataContext";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";
import type { NotificationType } from "../../../data/types";

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  booking_confirmed: CalendarCheck,
  checkin_reminder: Clock,
  waitlist_bump: ArrowUp,
  auto_release: AlertTriangle,
  general: Bell,
};

type FilterKey = "all" | "bookings" | "reminders" | "alerts";

const FILTERS: { key: FilterKey; label: string; types: NotificationType[] }[] = [
  { key: "all", label: "All", types: [] },
  { key: "bookings", label: "Bookings", types: ["booking_confirmed"] },
  { key: "reminders", label: "Reminders", types: ["checkin_reminder", "waitlist_bump"] },
  { key: "alerts", label: "Alerts", types: ["auto_release", "general"] },
];

export function NotificationCenter() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useMockData();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notifications]
  );

  const filtered = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter);
    if (!f || f.types.length === 0) return sorted;
    return sorted.filter((n) => f.types.includes(n.type));
  }, [sorted, filter]);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) setFilter("all");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" data-testid="notifications-button">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" data-testid="notifications-panel">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto gap-1 px-2 py-1 text-xs" onClick={markAllNotificationsRead}>
              <Check className="h-3 w-3" /> Mark all as read
            </Button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex gap-1 border-b px-3 py-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "secondary" : "ghost"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <ScrollArea className="max-h-80">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((n) => {
                const Icon = TYPE_ICONS[n.type] ?? Bell;
                return (
                  <button
                    key={n.id}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs ${!n.read ? "font-semibold text-foreground" : "text-foreground"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
