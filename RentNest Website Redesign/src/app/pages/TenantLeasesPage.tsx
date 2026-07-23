import React from "react";
import { Download, FileText, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useTenantLeasesQuery } from "@/features/tenant/hooks/useTenantData";

export const TenantLeasesPage: React.FC = () => {
  const { data: leases } = useTenantLeasesQuery();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          My Lease Agreements
        </h1>
        <p className="text-xs text-muted-foreground">
          Review terms, key dates, monthly rental commitments, and download signed lease contracts.
        </p>
      </div>

      <div className="space-y-4">
        {leases?.map((lease) => (
          <Card key={lease.id} variant="default" className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">{lease.propertyTitle}</h3>
                  <p className="text-xs text-muted-foreground">{lease.unitNumber} • Contract ID: {lease.id}</p>
                </div>
              </div>

              <StatusBadge status={lease.status === "ACTIVE" ? "CONFIRMED" : lease.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">Start Date</span>
                <strong className="text-foreground font-semibold">{lease.startDate}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Expiration Date</span>
                <strong className="text-foreground font-semibold">{lease.endDate}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Monthly Rent</span>
                <strong className="text-primary font-bold">${lease.monthlyRent.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Security Deposit</span>
                <strong className="text-foreground font-semibold">${lease.securityDeposit.toLocaleString()}</strong>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/30 flex justify-end">
              <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
                Download Lease Contract PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
