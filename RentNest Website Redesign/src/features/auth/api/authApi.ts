import type { LoginFormData, ForgotPasswordFormData, ResetPasswordFormData, VerifyEmailFormData } from "../schemas/authSchemas";
import type { UserClaims, UserRole } from "@/core/types/auth";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserClaims;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    await delay(800); // Artificial network latency

    if (data.email === "error@rentnest.com") {
      throw new Error("Invalid credentials provided.");
    }

    let role: UserRole = "ROLE_TENANT";
    if (data.email.includes("owner")) role = "ROLE_PROPERTY_OWNER";
    if (data.email.includes("vendor")) role = "ROLE_VENDOR";
    if (data.email.includes("admin")) role = "ROLE_ADMIN";

    const mockUser: UserClaims = {
      userId: 101,
      email: data.email,
      fullName: data.email.split("@")[0].toUpperCase().replace(".", " "),
      firstName: data.email.split("@")[0],
      lastName: "User",
      roleName: role,
      permissions: ["READ_PROPERTIES", "WRITE_BOOKINGS", "MANAGE_FINANCES"],
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    };

    return {
      accessToken: `mock_jwt_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: mockUser,
    };
  },

  register: async (payload: { email: string; firstName: string; lastName: string; roleName: string }): Promise<AuthResponse> => {
    await delay(1000);

    const mockUser: UserClaims = {
      userId: Math.floor(Math.random() * 1000) + 200,
      email: payload.email,
      fullName: `${payload.firstName} ${payload.lastName}`,
      firstName: payload.firstName,
      lastName: payload.lastName,
      roleName: payload.roleName as UserRole,
      permissions: ["READ_PROPERTIES"],
    };

    return {
      accessToken: `mock_jwt_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: mockUser,
    };
  },

  forgotPassword: async (data: ForgotPasswordFormData): Promise<{ success: boolean; message: string }> => {
    await delay(600);
    return {
      success: true,
      message: `Password reset link dispatched to ${data.email}`,
    };
  },

  resetPassword: async (_data: ResetPasswordFormData): Promise<{ success: boolean; message: string }> => {
    await delay(800);
    return {
      success: true,
      message: "Password reset successful. You may now sign in with your new password.",
    };
  },

  verifyEmail: async (data: VerifyEmailFormData): Promise<{ success: boolean; message: string }> => {
    await delay(700);
    if (data.code !== "123456") {
      throw new Error("Invalid or expired 6-digit verification code.");
    }
    return {
      success: true,
      message: "Email address verified successfully.",
    };
  },
};
