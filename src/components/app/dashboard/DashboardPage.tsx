import { format } from "date-fns";
import { useDemoRole } from "../../../contexts/DemoRoleContext";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { ErrorBoundary } from "../ErrorBoundary";
import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";
import { TodayBookingCard } from "./TodayBookingCard";
import { QuickStats } from "./QuickStats";
import { QuickActions } from "./QuickActions";
import { ActivityFeed } from "./ActivityFeed";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const { currentUser } = useDemoRole();
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const isLoading = useSimulatedLoading(500);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-6xl space-y-6" data-testid="page-dashboard">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          {getGreeting()}, {currentUser.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">{today}</p>
      </div>

      {/* Quick stats */}
      <ErrorBoundary fallbackTitle="Stats unavailable">
        <QuickStats />
      </ErrorBoundary>

      {/* Main grid: Today's booking + Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ErrorBoundary fallbackTitle="Booking card unavailable">
            <TodayBookingCard />
          </ErrorBoundary>
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Activity feed */}
      <ErrorBoundary fallbackTitle="Activity feed unavailable">
        <ActivityFeed />
      </ErrorBoundary>
    </div>
  );
}
