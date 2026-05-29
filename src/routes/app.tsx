import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { DemoRoleProvider } from "../contexts/DemoRoleContext";
import { MockDataProvider } from "../contexts/MockDataContext";
import { AppShell } from "../components/app/AppShell";
import { useEffect } from "react";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DemoRoleProvider initialRole={user.role} authUser={user}>
      <MockDataProvider>
        <AppShell />
      </MockDataProvider>
    </DemoRoleProvider>
  );
}
