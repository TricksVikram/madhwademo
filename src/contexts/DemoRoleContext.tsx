import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthUser, AppRole } from "./AuthContext";

export type Role = "user" | "admin";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

const defaultProfiles: Record<Role, MockUser> = {
  user: {
    id: "u-001",
    name: "Jane Cooper",
    email: "jane.cooper@deskflow.io",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "user",
  },
  admin: {
    id: "u-admin-001",
    name: "Alex Admin",
    email: "alex.admin@deskflow.io",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    role: "admin",
  },
};

interface DemoRoleContextValue {
  role: Role;
  currentUser: MockUser;
}

const DemoRoleContext = createContext<DemoRoleContextValue | null>(null);

interface DemoRoleProviderProps {
  children: ReactNode;
  initialRole?: AppRole;
  authUser?: AuthUser;
}

export function DemoRoleProvider({ children, initialRole, authUser }: DemoRoleProviderProps) {
  const role: Role = initialRole ?? "user";

  // Build currentUser from authUser if available, else use defaults
  const currentUser: MockUser = authUser
    ? {
        // Map auth user to the mock user ID the rest of the app expects
        id: role === "admin" ? "u-admin-001" : "u-001",
        name: authUser.displayName || authUser.email.split("@")[0],
        email: authUser.email,
        avatar: authUser.avatarUrl || defaultProfiles[role].avatar,
        role,
      }
    : defaultProfiles[role];

  return (
    <DemoRoleContext.Provider value={{ role, currentUser }}>
      {children}
    </DemoRoleContext.Provider>
  );
}

export function useDemoRole(): DemoRoleContextValue {
  const ctx = useContext(DemoRoleContext);
  if (!ctx) {
    throw new Error("useDemoRole must be used within a DemoRoleProvider");
  }
  return ctx;
}
