import React, { useState, useEffect } from "react";
import { Save, Building, CreditCard, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useVendorSettingsQuery, useUpdateSettingsMutation } from "@/features/vendor/hooks/useVendorData";
import { showToast } from "@/components/ui/Toast";

export const VendorSettingsPage: React.FC = () => {
  const { data: settings } = useVendorSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();

  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [hourlyLaborRate, setHourlyLaborRate] = useState(95);

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName);
      setContactEmail(settings.contactEmail);
      setHourlyLaborRate(settings.hourlyLaborRate);
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(
      { companyName, contactEmail, hourlyLaborRate: Number(hourlyLaborRate) },
      {
        onSuccess: () => {
          showToast.success("Settings Saved", "Vendor profile configuration updated.");
        },
      }
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Vendor Company Profile & Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage company licensure, labor rates, direct deposit bank accounts, and alert preferences.
        </p>
      </div>

      <Card variant="default" className="p-6">
        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Company Registered Name</label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Dispatch Contact Email</label>
            <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Standard Hourly Labor Rate ($)</label>
            <Input type="number" value={hourlyLaborRate} onChange={(e) => setHourlyLaborRate(Number(e.target.value))} />
          </div>

          <div className="pt-3 border-t border-border/40">
            <Button variant="primary" size="sm" type="submit" leftIcon={<Save className="h-4 w-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default VendorSettingsPage;
