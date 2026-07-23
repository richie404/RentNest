import React from "react";
import { Shield, Key } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAdminRolesQuery } from "@/features/admin/hooks/useAdminData";

export const AdminRolesPage: React.FC = () => {
  const { data: roles = [] } = useAdminRolesQuery();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          RBAC Roles & Authorization Matrix
        </h1>
        <p className="text-xs text-muted-foreground">
          Define access control roles, assigned permission sets, and security scope definitions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.id} variant="default" className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xs">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">{role.roleName}</h3>
                  <span className="text-[10px] text-primary font-mono font-bold">{role.roleCode}</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{role.usersCount} Active Users</span>
            </div>

            <p className="text-xs text-muted-foreground">{role.description}</p>

            <div className="space-y-1.5 pt-2 border-t border-border/20">
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Assigned Scope Permissions</span>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((p) => (
                  <span key={p} className="px-2.5 py-1 rounded-xl bg-background border border-border/50 text-[10px] font-semibold text-muted-foreground">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminRolesPage;
