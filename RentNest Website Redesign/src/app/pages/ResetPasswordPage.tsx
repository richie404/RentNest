import React from "react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const ResetPasswordPage: React.FC = () => {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
};
