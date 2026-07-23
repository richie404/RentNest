import React from "react";
import { useNavigate } from "react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleReturnDashboard = () => {
    switch (user?.roleName) {
      case "ROLE_PROPERTY_OWNER":
        navigate("/app/owner/dashboard");
        break;
      case "ROLE_VENDOR":
        navigate("/app/vendor/dashboard");
        break;
      case "ROLE_ADMIN":
        navigate("/app/admin/dashboard");
        break;
      case "ROLE_TENANT":
        navigate("/app/tenant/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-2xl">
        <ShieldAlert className="h-10 w-10" />
      </div>

      <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-foreground">
        403 — Access Forbidden
      </h1>

      <p className="mt-2 max-w-md text-xs text-muted-foreground">
        You do not possess the required RBAC security clearance or role permissions to access this endpoint.
      </p>

      <button
        onClick={handleReturnDashboard}
        className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Authorized Dashboard
      </button>
    </div>
  );
};
