import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LogIn, UserPlus, Shield, User } from "lucide-react";
import { Logo } from "../components/app/Logo";
import featuresPhoto from "@/assets/features-photo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const DEMO_ACCOUNTS = {
  user: {
    email: "lisa-test-user@test.com",
    password: "LisaLoops-Test-2024!",
    displayName: "Jane Cooper",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "user" as const,
    label: "Employee",
    description: "Book desks, view floor maps, manage bookings",
    icon: User,
  },
  admin: {
    email: "lisa-test-admin@test.com",
    password: "LisaLoops-Test-2024!",
    displayName: "Alex Admin",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    role: "admin" as const,
    label: "Admin",
    description: "Full access including analytics and office builder",
    icon: Shield,
  },
};

function waitForAuthUser(): Promise<void> {
  return new Promise((resolve) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        subscription.unsubscribe();
        resolve();
      }
    });
    // Also check if session is already present
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        subscription.unsubscribe();
        resolve();
      }
    });
  });
}

function LoginPage() {
  const { signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      await waitForAuthUser();
      navigate({ to: "/app" });
    }
  };

  const handleDemoLogin = async (role: "user" | "admin") => {
    const account = DEMO_ACCOUNTS[role];
    setError("");
    setDemoLoading(role);

    // Try to sign in first
    let result = await signIn(account.email, account.password);

    // If user doesn't exist, create the account then sign in
    if (result.error && result.error.includes("Invalid login credentials")) {
      const signUpResult = await signUp(account.email, account.password, {
        display_name: account.displayName,
        avatar_url: account.avatar,
        app_role: account.role,
      });

      if (signUpResult.error && !signUpResult.error.includes("already registered")) {
        setError(signUpResult.error);
        setDemoLoading(null);
        return;
      }

      // Sign in (works whether signup succeeded or user already existed)
      result = await signIn(account.email, account.password);
    }

    if (result.error) {
      setError(result.error);
      setDemoLoading(null);
    } else {
      await waitForAuthUser();
      navigate({ to: "/app" });
    }
  };

  return (
    <div className="flex min-h-screen bg-background" data-testid="page-login">
      {/* Left panel — photo */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          src={featuresPhoto.url}
          alt="Team collaborating in an office"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center bg-card px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div>
            <Link to="/" className="flex mb-6">
              <Logo className="text-2xl" />
            </Link>
            <h2 className="text-balance text-2xl font-semibold text-foreground">Get started and manage your workspace</h2>
          </div>

          {/* Demo account buttons */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">View a demo</p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(DEMO_ACCOUNTS) as [string, typeof DEMO_ACCOUNTS.user][]).map(([key, account]) => {
                const Icon = account.icon;
                return (
                  <button
                    key={key}
                    onClick={() => handleDemoLogin(key as "user" | "admin")}
                    disabled={!!demoLoading}
                    data-testid={`demo-login-${key}`}
                    className="relative flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-4 text-center transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                  >
                    {demoLoading === key && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    )}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{account.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{account.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Or sign in with email</span>
            </div>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="login-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="login-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center" data-testid="login-error">{error}</p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isLoading || !!demoLoading} data-testid="login-submit">
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
