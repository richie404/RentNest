import React from "react";
import { AppShell } from "../../components/shared/AppShell";
import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";
import { MetricDashboardWidget } from "../../components/ui/MetricDashboardWidget";
import { Users, Building2, ShieldCheck, Activity } from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
      <AppShell>
        <div className="space-y-8">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Platform Governance Control Center
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              System health monitoring, user directory moderation, and forensic audit logs.
            </p>
          </div>

          {/* Admin Metric KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricDashboardWidget
              title="Total Active Users"
              value="14,280"
              subtitle="7,420 Tenants • 1,240 Owners"
              trendAmount="+8.4%"
              trendDirection="up"
              icon={<Users className="h-5 w-5" />}
            />
            <MetricDashboardWidget
              title="Pending Listing Reviews"
              value="5 Property"
              subtitle="Awaiting Verification"
              trendAmount="5 Flags"
              trendDirection="down"
              icon={<Building2 className="h-5 w-5" />}
            />
            <MetricDashboardWidget
              title="Audit Logs Today"
              value="1,842 Events"
              subtitle="0 Security Violations"
              trendAmount="Secure"
              trendDirection="up"
              icon={<ShieldCheck className="h-5 w-5" />}
            />
            <MetricDashboardWidget
              title="System Uptime"
              value="99.98%"
              subtitle="MySQL 8 Master Node Active"
              icon={<Activity className="h-5 w-5" />}
            />
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};
