import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { AppSidebar } from "./AppSidebar";
import { RoleSwitcher } from "./RoleSwitcher";
import { NotificationCenter } from "./notifications/NotificationCenter";

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6" data-testid="app-header">
      {/* Left side — mobile menu button */}
      <div className="flex items-center gap-2">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <AppSidebar onNavClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Right side — notifications & role switcher */}
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <RoleSwitcher />
      </div>
    </header>
  );
}
