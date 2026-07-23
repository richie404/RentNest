import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useOwnerApprovalsQuery } from "@/features/owner/hooks/useOwnerData";
import { showToast } from "@/components/ui/Toast";

export const OwnerLeaseApprovalsPage: React.FC = () => {
  const { data: approvals } = useOwnerApprovalsQuery();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Lease Application Queue
        </h1>
        <p className="text-xs text-muted-foreground">
          Review tenant applicant credit scores, background checks, proposed move-in dates, and approve contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {approvals?.map((app) => (
          <Card key={app.id} variant="default" className="p-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">{app.applicantName}</h3>
                <p className="text-xs text-muted-foreground">{app.propertyTitle}</p>
              </div>
              <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                Credit Score: {app.applicantCreditScore}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proposed Monthly Rent:</span>
                <strong className="text-primary">${app.proposedRent.toLocaleString()}/mo</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested Move-in Date:</span>
                <strong className="text-foreground">{app.moveInDate}</strong>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/30 flex gap-3 justify-end">
              <Button
                variant="outline"
                size="md"
                onClick={() => showToast.error("Application Rejected", `Rejected applicant ${app.applicantName}`)}
              >
                <XCircle className="h-4 w-4 mr-1.5" /> Decline
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => showToast.success("Lease Approved", `Approved lease for ${app.applicantName}`)}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Approve & Sign Lease
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
