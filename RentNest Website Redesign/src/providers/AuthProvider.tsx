import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import type { UserClaims, UserRole } from "@/core/types/auth";

interface AuthContextType {
  user: UserClaims | null;
  isAuthenticated: boolean;
  userRole: UserRole;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, hasRole, hasPermission } = useAuthStore();

  useEffect(() => {
    // Hydrate or validate stored token validity on application mount
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    userRole: user?.roleName || "ROLE_GUEST",
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
};
