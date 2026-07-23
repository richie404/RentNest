import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserClaims, UserRole } from "../types/auth";

interface AuthStoreState {
  user: UserClaims | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setSession: (token: string, user: UserClaims) => void;
  clearSession: () => void;
  setUser: (user: UserClaims) => void;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permissionCode: string) => boolean;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setSession: (token: string, user: UserClaims) => {
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clearSession: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user: UserClaims) => {
        set({ user });
      },

      hasRole: (role: UserRole) => {
        const currentUser = get().user;
        if (!currentUser) return role === 'ROLE_GUEST';
        return currentUser.roleName === role;
      },

      hasPermission: (permissionCode: string) => {
        const currentUser = get().user;
        if (!currentUser) return false;
        if (currentUser.roleName === 'ROLE_ADMIN') return true; // Admins bypass permission checks
        return currentUser.permissions.includes(permissionCode);
      },
    }),
    {
      name: "rentnest_auth_session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
