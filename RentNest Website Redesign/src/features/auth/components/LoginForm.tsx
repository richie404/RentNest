import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { loginSchema, type LoginFormData } from "../schemas/authSchemas";
import { useLoginMutation } from "../hooks/useAuthMutations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        switch (res.user.roleName) {
          case "ROLE_PROPERTY_OWNER":
            navigate("/app/owner/dashboard");
            break;
          case "ROLE_VENDOR":
            navigate("/app/vendor/dashboard");
            break;
          case "ROLE_ADMIN":
            navigate("/app/admin/dashboard");
            break;
          default:
            navigate("/app/tenant/dashboard");
        }
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-3xl border border-border/60 bg-card p-8 shadow-2xl backdrop-blur-xl"
    >
      <div className="text-center mb-6">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Welcome Back to RentNest
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Sign in to manage your properties, payments, and lease agreements.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Checkbox label="Remember Me" {...register("rememberMe")} />
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={loginMutation.isPending}
          leftIcon={<LogIn className="h-4 w-4" />}
        >
          Sign In to Portal
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="font-bold text-primary hover:underline">
          Create Account
        </Link>
      </div>
    </motion.div>
  );
};
