import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: AppRole;
}

interface AuthContextValue {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, meta?: { display_name?: string; avatar_url?: string; app_role?: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Defer profile fetch to avoid blocking
        setTimeout(() => fetchUserProfile(session.user), 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(authUser: User) {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", authUser.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", authUser.id),
      ]);

      const profile = profileRes.data;
      const roles = roleRes.data ?? [];
      const isAdmin = roles.some((r: { role: string }) => r.role === "admin");

      setUser({
        id: authUser.id,
        email: authUser.email ?? "",
        displayName: profile?.display_name || authUser.email?.split("@")[0] || "",
        avatarUrl: profile?.avatar_url || "",
        role: isAdmin ? "admin" : "user",
      });
    } catch {
      setUser({
        id: authUser.id,
        email: authUser.email ?? "",
        displayName: authUser.email?.split("@")[0] || "",
        avatarUrl: "",
        role: "user",
      });
    }
    setLoading(false);
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, meta?: { display_name?: string; avatar_url?: string; app_role?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
