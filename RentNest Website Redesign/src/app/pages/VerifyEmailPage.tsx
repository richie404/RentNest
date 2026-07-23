import React from "react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

export const VerifyEmailPage: React.FC = () => {
  return (
    <AuthLayout>
      <VerifyEmailForm />
    </AuthLayout>
  );
};
