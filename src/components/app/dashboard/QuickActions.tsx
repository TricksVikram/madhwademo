import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, BookOpen, Users, BarChart3, Blocks } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useAuth } from "../../../contexts/AuthContext";
import { BookingWizard } from "../booking/wizard/BookingWizard";

export function QuickActions() {
  const { user } = useAuth();
  const role = user?.role;
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="justify-start gap-2"
            onClick={() => setWizardOpen(true)}
            data-testid="quick-book-desk"
          >
            <MapPin className="h-4 w-4" />
            Book a desk
          </Button>
          {role === "admin" ? (
            <>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link to="/app/admin/analytics">
                  <BarChart3 className="h-4 w-4" />
                  View analytics
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link to="/app/admin/office-builder">
                  <Blocks className="h-4 w-4" />
                  Office builder
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link to="/app/bookings">
                  <BookOpen className="h-4 w-4" />
                  View my bookings
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link to="/app/team">
                  <Users className="h-4 w-4" />
                  Find teammates
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <BookingWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  );
}
