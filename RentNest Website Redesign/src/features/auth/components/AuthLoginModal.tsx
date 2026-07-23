import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { loginSchema, type LoginSchemaType } from "../schemas/authSchemas";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";
import { cn } from "../../../lib/utils";

interface AuthLoginModalProps {
  onSuccess?: () => void;
  onForgotPasswordClick?: () => void;
  onRegisterClick?: () => void;
}

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({
  onSuccess,
  onForgotPasswordClick,
  onRegisterClick,
}) => {
  const { login, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setServerError(null);
    try {
      const response = await login(data);
      if (response.success && response.user) {
        if (onSuccess) onSuccess();
        navigate(getDashboardRoute(response.user.roleName));
      } else {
        setServerError(response.message || "Failed to log in. Please check your credentials.");
      }
    } catch (err: unknown) {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-border/50 bg-card/95 p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LogIn className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight text-foreground">
          Welcome Back to RentNest
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Sign in to access your property portal
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {/* Email Input */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-foreground">
            Email Address
          </label>
          <div className="relative mt-1">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              className={cn(
                "w-full rounded-xl border bg-background/50 py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
                errors.email
                  ? "border-rose-500 focus:ring-rose-500/30"
                  : "border-border/60 focus:border-primary focus:ring-primary/20"
              )}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1 text-[11px] font-medium text-rose-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-xs font-semibold text-foreground">
              Password
            </label>
            {onForgotPasswordClick && (
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Forgot Password?
              </button>
            )}
          </div>
          <div className="relative mt-1">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={cn(
                "w-full rounded-xl border bg-background/50 py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
                errors.password
                  ? "border-rose-500 focus:ring-rose-500/30"
                  : "border-border/60 focus:border-primary focus:ring-primary/20"
              )}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1 text-[11px] font-medium text-rose-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            {...register("rememberMe")}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
          />
          <label htmlFor="remember-me" className="text-xs text-muted-foreground">
            Remember me on this device
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In to Portal</span>
          )}
        </button>
      </form>

      {onRegisterClick && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <button
            onClick={onRegisterClick}
            className="font-semibold text-primary hover:underline"
          >
            Create an Account
          </button>
        </p>
      )}
    </div>
  );
};
