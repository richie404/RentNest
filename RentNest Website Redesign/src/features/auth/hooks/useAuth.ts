import { useAuthStore } from "../../../core/store/useAuthStore";
import type { UserRole, LoginCredentials, AuthResponse } from "../../../core/types/auth";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const hasRole = useAuthStore((state) => state.hasRole);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // In production, this calls backend API via TanStack Query / Axios
    // For now, simulate authenticated session response with role matching
    const mockRole: UserRole = credentials.email.includes("owner")
      ? "ROLE_PROPERTY_OWNER"
      : credentials.email.includes("admin")
      ? "ROLE_ADMIN"
      : credentials.email.includes("vendor")
      ? "ROLE_VENDOR"
      : "ROLE_TENANT";

    const mockSession = {
      token: "jwt_mock_token_" + Date.now(),
      user: {
        userId: 1,
        email: credentials.email,
        firstName: "Demo",
        lastName: "User",
        fullName: "Demo User",
        roleName: mockRole,
        permissions: ["VIEW_PROPERTIES", "BOOK_UNITS", "SUBMIT_MAINTENANCE"],
        mfaEnabled: false,
        status: "ACTIVE" as const,
      },
    };

    setSession(mockSession.token, mockSession.user);
    return { success: true, message: "Logged in successfully", user: mockSession.user };
  };

  const logout = () => {
    clearSession();
  };

  const getDashboardRoute = (roleName?: UserRole): string => {
    const activeRole = roleName || user?.roleName || "ROLE_GUEST";
    switch (activeRole) {
      case "ROLE_PROPERTY_OWNER":
        return "/app/owner/dashboard";
      case "ROLE_VENDOR":
        return "/app/vendor/dashboard";
      case "ROLE_ADMIN":
        return "/app/admin/dashboard";
      case "ROLE_TENANT":
        return "/app/tenant/dashboard";
      default:
        return "/";
    }
  };

  return {
    user,
    isAuthenticated,
    userRole: user?.roleName || "ROLE_GUEST",
    login,
    logout,
    hasRole,
    hasPermission,
    getDashboardRoute,
  };
}
