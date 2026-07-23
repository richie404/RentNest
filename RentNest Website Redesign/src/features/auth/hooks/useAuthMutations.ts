import { useMutation } from "@tanstack/react-query";
import { authApi, type AuthResponse } from "../api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { showToast } from "@/components/ui/Toast";
import type { LoginFormData, ForgotPasswordFormData, ResetPasswordFormData, VerifyEmailFormData } from "../schemas/authSchemas";

export const useLoginMutation = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: (response: AuthResponse) => {
      setSession(response.accessToken, response.user);
      showToast.success("Welcome back!", `Signed in as ${response.user.fullName}`);
    },
    onError: (error: Error) => {
      showToast.error("Authentication Failed", error.message || "Invalid credentials.");
    },
  });
};

export const useRegisterMutation = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: { email: string; firstName: string; lastName: string; roleName: string }) =>
      authApi.register(payload),
    onSuccess: (response: AuthResponse) => {
      setSession(response.accessToken, response.user);
      showToast.success("Registration Complete!", `Account created for ${response.user.fullName}`);
    },
    onError: (error: Error) => {
      showToast.error("Registration Failed", error.message);
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordFormData) => authApi.forgotPassword(data),
    onSuccess: (res) => {
      showToast.success("Reset Link Sent", res.message);
    },
    onError: (error: Error) => {
      showToast.error("Request Failed", error.message);
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordFormData) => authApi.resetPassword(data),
    onSuccess: (res) => {
      showToast.success("Password Updated", res.message);
    },
    onError: (error: Error) => {
      showToast.error("Reset Failed", error.message);
    },
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: (data: VerifyEmailFormData) => authApi.verifyEmail(data),
    onSuccess: (res) => {
      showToast.success("Email Verified", res.message);
    },
    onError: (error: Error) => {
      showToast.error("Verification Failed", error.message);
    },
  });
};
