import { useAuth } from "../../../contexts/AuthContext";
import { ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { AdminResourcesTab } from "./AdminResourcesTab";
import { BookingRules } from "./BookingRules";
import { AdminVisitors } from "../visitors/AdminVisitors";

export function AdminPage() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center" data-testid="admin-access-denied">
        <ShieldAlert className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold text-foreground">Access denied</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You need admin privileges to view this page
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6" data-testid="page-admin">
      <h1 className="text-2xl font-bold text-foreground">Admin dashboard</h1>

      <Tabs defaultValue="resources">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="rules">Booking rules</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="mt-4">
          <AdminResourcesTab />
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <BookingRules />
        </TabsContent>

        <TabsContent value="visitors" className="mt-4">
          <AdminVisitors />
        </TabsContent>
      </Tabs>
    </div>
  );
}
