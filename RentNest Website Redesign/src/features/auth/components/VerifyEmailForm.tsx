import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { ShieldCheck, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { verifyEmailSchema, type VerifyEmailFormData } from "../schemas/authSchemas";
import { useVerifyEmailMutation } from "../hooks/useAuthMutations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const VerifyEmailForm: React.FC = () => {
  const navigate = useNavigate();
  const verifyMutation = useVerifyEmailMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = (data: VerifyEmailFormData) => {
    verifyMutation.mutate(data, {
      onSuccess: () => navigate("/login"),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full rounded-3xl border border-border/60 bg-card p-8 shadow-2xl backdrop-blur-xl max-w-md mx-auto text-center"
    >
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
        <ShieldCheck className="h-7 w-7" />
      </div>

      <h2 className="font-heading text-xl font-bold text-foreground">Verify Your Email Address</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        We sent a 6-digit OTP verification code to your inbox. (Use <code className="font-mono text-primary font-bold">123456</code> for testing)
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="6-Digit Verification Code"
          type="text"
          maxLength={6}
          placeholder="123456"
          className="text-center font-mono text-lg tracking-widest"
          error={errors.code?.message}
          {...register("code")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={verifyMutation.isPending}
          leftIcon={<CheckCircle className="h-4 w-4" />}
        >
          Confirm & Verify Account
        </Button>
      </form>
    </motion.div>
  );
};
