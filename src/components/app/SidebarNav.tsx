import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Map,
  BookOpen,
  Users,
  CalendarDays,
  Package,
  Building2,
  BarChart3,
  Blocks,
} from "lucide-react";
import { cn } from "../../lib/utils";

const userNavItems = [
  { to: "/app", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/floor-map", icon: Map, label: "Floor map" },
  { to: "/app/bookings", icon: BookOpen, label: "My bookings" },
  { to: "/app/resources", icon: Package, label: "Parking & lockers" },
  { to: "/app/team", icon: Users, label: "Team" },
  { to: "/app/planner", icon: CalendarDays, label: "My week" },
] as const;

const adminNavItems = [
  { to: "/app/admin", icon: Building2, label: "Manage office" },
  { to: "/app/admin/office-builder", icon: Blocks, label: "Office builder" },
  { to: "/app/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/app/calendar", icon: Calendar, label: "Calendar" },
] as const;

interface SidebarNavProps {
  onNavClick?: () => void;
}

export function SidebarNav({ onNavClick }: SidebarNavProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-1" data-testid="sidebar-nav">
      {userNavItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to === "/app" }}
          onClick={onNavClick}
          data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          activeProps={{
            className:
              "bg-muted text-foreground hover:bg-muted hover:text-foreground",
          }}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}

      {user?.role === "admin" && (
        <>
          <div className="mt-4 mb-1 px-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Admin
            </span>
          </div>
          {adminNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/app/admin" }}
              onClick={onNavClick}
              data-testid={`nav-admin-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              activeProps={{
                className:
                  "bg-muted text-foreground hover:bg-muted hover:text-foreground",
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </>
      )}
    </div>
  );
}
