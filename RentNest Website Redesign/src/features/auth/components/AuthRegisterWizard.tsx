import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Building2, Wrench, ShieldCheck, Mail, Lock, Phone, ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { registerSchema, type RegisterSchemaType } from "../schemas/authSchemas";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";
import { cn } from "../../../lib/utils";

interface AuthRegisterWizardProps {
  onLoginClick?: () => void;
}

export const AuthRegisterWizard: React.FC<AuthRegisterWizardProps> = ({ onLoginClick }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      roleId: 1, // Default 1: Tenant
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const selectedRoleId = watch("roleId");

  const roles = [
    {
      id: 1,
      title: "Residential Tenant",
      description: "Find rental listings, pay rent online, and submit work order requests.",
      icon: User,
    },
    {
      id: 2,
      title: "Property Owner",
      description: "List rental properties, approve applicant leases, and track payout metrics.",
      icon: Building2,
    },
    {
      id: 3,
      title: "Maintenance Vendor",
      description: "Receive trade repair dispatches, fulfill SLA orders, and track billing.",
      icon: Wrench,
    },
  ];

  const nextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const isValid = await trigger(["firstName", "lastName", "phoneNumber"]);
      if (isValid) setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
  };

  const onSubmit = async (data: RegisterSchemaType) => {
    setServerError(null);
    try {
      // Simulate registration endpoint trigger
      navigate(getDashboardRoute(data.roleId === 2 ? "ROLE_PROPERTY_OWNER" : data.roleId === 3 ? "ROLE_VENDOR" : "ROLE_TENANT"));
    } catch (err: unknown) {
      setServerError("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-border/50 bg-card/95 p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Create Your RentNest Account
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Step {step} of 3 — Onboarding Wizard</p>

        {/* Progress Bar */}
        <div className="mt-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {serverError && (
        <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600 border border-rose-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
        {/* Step 1: Role Card Selection */}
        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-foreground">Select Account Role</label>
            <div className="grid gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRoleId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setValue("roleId", r.id)}
                    className={cn(
                      "cursor-pointer flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                        : "border-border/60 bg-background/50 hover:border-border"
                    )}
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{r.title}</h4>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              <span>Continue to Personal Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Personal Profile Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">First Name</label>
                <input
                  type="text"
                  placeholder="Jane"
                  {...register("firstName")}
                  className="mt-1 w-full rounded-xl border border-border/60 bg-background/50 py-2.5 px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.firstName && <p className="mt-1 text-[11px] text-rose-500">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  className="mt-1 w-full rounded-xl border border-border/60 bg-background/50 py-2.5 px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.lastName && <p className="mt-1 text-[11px] text-rose-500">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">Phone Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...register("phoneNumber")}
                  className="w-full rounded-xl border border-border/60 bg-background/50 py-2.5 pl-10 pr-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-[11px] text-rose-500">{errors.phoneNumber.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
              >
                <span>Continue to Credentials</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Security Credentials */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="jane.doe@example.com"
                  {...register("email")}
                  className="w-full rounded-xl border border-border/60 bg-background/50 py-2.5 pl-10 pr-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] text-rose-500">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="mt-1 w-full rounded-xl border border-border/60 bg-background/50 py-2.5 px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.password && <p className="mt-1 text-[11px] text-rose-500">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="mt-1 w-full rounded-xl border border-border/60 bg-background/50 py-2.5 px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.confirmPassword && <p className="mt-1 text-[11px] text-rose-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                {...register("termsAccepted")}
                className="h-4 w-4 rounded border-border text-primary"
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground">
                I agree to the RentNest Terms of Service & Privacy Policy
              </label>
            </div>
            {errors.termsAccepted && <p className="text-[11px] text-rose-500">{errors.termsAccepted.message}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Create Account</span>}
              </button>
            </div>
          </div>
        )}
      </form>

      {onLoginClick && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <button onClick={onLoginClick} className="font-semibold text-primary hover:underline">
            Sign In
          </button>
        </p>
      )}
    </div>
  );
};
