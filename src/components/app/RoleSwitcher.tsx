import { useAuth } from "../../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "../ui/badge";

export function RoleSwitcher() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3" data-testid="role-switcher">
      {/* User name — hidden on small screens */}
      <span className="hidden text-sm font-medium text-foreground sm:inline">
        {user.displayName}
      </span>

      {/* Avatar */}
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatarUrl} alt={user.displayName} />
        <AvatarFallback className="text-xs">
          {user.displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>

      {/* Role badge */}
      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs capitalize">
        {user.role}
      </Badge>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Sign out"
        data-testid="sign-out-button"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
