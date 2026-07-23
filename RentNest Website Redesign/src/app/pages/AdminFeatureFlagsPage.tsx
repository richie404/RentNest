import React from "react";
import { ToggleLeft, ToggleRight, Flag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminFeatureFlagsQuery, useToggleFeatureFlagMutation } from "@/features/admin/hooks/useAdminData";
import { showToast } from "@/components/ui/Toast";

export const AdminFeatureFlagsPage: React.FC = () => {
  const { data: flags = [] } = useAdminFeatureFlagsQuery();
  const toggleMutation = useToggleFeatureFlagMutation();

  const handleToggle = (flagId: string, currentEnabled: boolean) => {
    toggleMutation.mutate(
      { flagId, enabled: !currentEnabled },
      {
        onSuccess: () => {
          showToast.success("Feature Flag Updated", `Flag state toggled to ${!currentEnabled ? "ENABLED" : "DISABLED"}.`);
        },
      }
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Platform Feature Flags & Progressive Rollout
        </h1>
        <p className="text-xs text-muted-foreground">
          Toggle beta feature flags, configure percentage rollout strategies, and target specific user roles.
        </p>
      </div>

      <div className="space-y-4">
        {flags.map((flag) => (
          <Card key={flag.id} variant="default" className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-primary block">{flag.flagKey}</span>
                <h3 className="font-heading text-base font-bold text-foreground">{flag.title}</h3>
              </div>

              <button
                onClick={() => handleToggle(flag.id, flag.enabled)}
                className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all"
              >
                {flag.enabled ? (
                  <ToggleRight className="h-8 w-8 text-emerald-500" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                )}
                <span className={`text-xs font-bold ${flag.enabled ? "text-emerald-500" : "text-muted-foreground"}`}>
                  {flag.enabled ? "ENABLED" : "DISABLED"}
                </span>
              </button>
            </div>

            <p className="text-xs text-muted-foreground">{flag.description}</p>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground">
                Target Roles: <strong>{flag.targetRoles.join(", ")}</strong>
              </span>
              <span className="font-bold text-primary">Rollout: {flag.rolloutPercentage}%</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminFeatureFlagsPage;
