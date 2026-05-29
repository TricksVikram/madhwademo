import {
  LayoutDashboard,
  Map,
  BookOpen,
  Package,
  Users,
  CalendarDays,
  Monitor,
  Car,
  Lock,
  CalendarCheck,
  MapPin,
  Clock,
  Bell,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Map, label: "Floor map", active: false },
  { icon: BookOpen, label: "My bookings", active: false },
  { icon: Package, label: "Parking & lockers", active: false },
  { icon: Users, label: "Team", active: false },
  { icon: CalendarDays, label: "My week", active: false },
];

export function DashboardMockup() {
  return (
    <div className="relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-xl border-[3px] border-foreground/80 bg-card shadow-2xl">
      {/* Title bar */}
      <div className="flex h-10 items-center gap-2 border-b border-border bg-muted/50 px-4">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-destructive/60" />
          <span className="h-3 w-3 rounded-full bg-chart-4/60" />
          <span className="h-3 w-3 rounded-full bg-chart-2/60" />
        </div>
        <span className="ml-2 text-xs text-muted-foreground">
          DeskFlow — Dashboard
        </span>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100%-2.5rem)]">
        {/* Mini sidebar */}
        <div className="hidden w-40 border-r border-border bg-card p-3 sm:block">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              DeskFlow
            </span>
          </div>
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              className={`mb-0.5 flex items-center gap-2 rounded px-2 py-1.5 text-[10px] font-medium ${
                item.active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 overflow-hidden bg-background p-4 md:p-5">
          {/* Greeting */}
          <div className="mb-3">
            <p className="text-sm font-bold text-foreground md:text-base">
              Good morning, Lisa
            </p>
            <p className="text-[10px] text-muted-foreground">
              Tuesday, April 14, 2026
            </p>
          </div>

          {/* Stats bar */}
          <div className="mb-3 flex items-center gap-3 rounded border border-border bg-card p-2">
            <div className="flex items-center gap-1.5 text-[10px]">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-chart-2/10">
                <Monitor className="h-2.5 w-2.5 text-chart-2" />
              </div>
              <span className="font-semibold text-foreground">24</span>
              <span className="text-muted-foreground">desks</span>
            </div>
            <span className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-[10px]">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-chart-3/10">
                <Car className="h-2.5 w-2.5 text-chart-3" />
              </div>
              <span className="font-semibold text-foreground">8</span>
              <span className="text-muted-foreground">parking</span>
            </div>
            <span className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-[10px]">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-chart-5/10">
                <Lock className="h-2.5 w-2.5 text-chart-5" />
              </div>
              <span className="font-semibold text-foreground">9</span>
              <span className="text-muted-foreground">lockers</span>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Today's booking card */}
            <div className="col-span-2 relative rounded border border-border bg-card p-3 pl-4">
              <div className="absolute left-0.5 top-0.5 bottom-0.5 w-0.5 rounded-full bg-primary" />
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground mb-1.5">
                <CalendarCheck className="h-3 w-3 text-primary" />
                Today's booking
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">D-01</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[9px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      Ground floor
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      09:00 – 17:00
                    </span>
                  </div>
                </div>
                <div className="rounded bg-primary px-2 py-1 text-[9px] font-medium text-primary-foreground">
                  Check in
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded border border-border bg-card p-3">
              <p className="text-[10px] font-semibold text-foreground mb-1.5">
                Quick actions
              </p>
              <div className="space-y-1">
                {["Book a desk", "View my bookings", "Find teammates"].map(
                  (action) => (
                    <div
                      key={action}
                      className="rounded border border-border px-2 py-1 text-[9px] text-foreground"
                    >
                      {action}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div className="mt-3 rounded border border-border bg-card p-3">
            <p className="text-[10px] font-semibold text-foreground mb-1.5">
              Recent activity
            </p>
            <div className="space-y-1.5">
              {[
                "Booking confirmed — D-01 for today",
                "Check-in reminder — D-03 by 9:15 AM",
                "Room Maple reserved for 2:00–3:00 PM",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-[9px] text-muted-foreground"
                >
                  <Bell className="h-2.5 w-2.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
