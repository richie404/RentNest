import React from "react";
import { AppShell } from "../../components/shared/AppShell";
import { AuthRegisterWizard } from "../../features/auth/components/AuthRegisterWizard";
import { useNavigate } from "react-router";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="flex min-h-[75vh] items-center justify-center py-10">
        <AuthRegisterWizard onLoginClick={() => navigate("/login")} />
      </div>
    </AppShell>
  );
};
