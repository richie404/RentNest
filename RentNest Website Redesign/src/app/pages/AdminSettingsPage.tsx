import React, { useState } from "react";
import { Save, Settings, Shield, Sliders } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui/Toast";

export const AdminSettingsPage: React.FC = () => {
  const [platformName, setPlatformName] = useState("RentNest SaaS Platform");
  const [platformCommissionPct, setPlatformCommissionPct] = useState(5.0);
  const [maintenanceSlaHours, setMaintenanceSlaHours] = useState(24);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast.success("Platform Settings Saved", "Global system thresholds updated.");
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Platform System Configuration & Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Configure default platform commission yield fees, global maintenance SLA windows, and rate limits.
        </p>
      </div>

      <Card variant="default" className="p-6">
        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Platform Brand Title</label>
            <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Default Platform Commission Fee (%)</label>
            <Input type="number" step="0.1" value={platformCommissionPct} onChange={(e) => setPlatformCommissionPct(Number(e.target.value))} />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Urgent Maintenance SLA Resolution Limit (Hours)</label>
            <Input type="number" value={maintenanceSlaHours} onChange={(e) => setMaintenanceSlaHours(Number(e.target.value))} />
          </div>

          <div className="pt-3 border-t border-border/40">
            <Button variant="primary" size="sm" type="submit" leftIcon={<Save className="h-4 w-4" />}>
              Save Global Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
