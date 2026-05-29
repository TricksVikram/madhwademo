import { Outlet, useLocation } from "@tanstack/react-router";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { PageTransition } from "./PageTransition";

export function AppShell() {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="app-shell">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border bg-card">
        <AppSidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <PageTransition transitionKey={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
