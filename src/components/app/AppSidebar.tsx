import { Link } from "@tanstack/react-router";
import { SidebarNav } from "./SidebarNav";
import { Logo } from "./Logo";

interface AppSidebarProps {
  onNavClick?: () => void;
}

export function AppSidebar({ onNavClick }: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link to="/app">
          <Logo />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav onNavClick={onNavClick} />
      </nav>
    </div>
  );
}
