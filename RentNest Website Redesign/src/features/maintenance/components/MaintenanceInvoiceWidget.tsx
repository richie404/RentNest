import React from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { MaintenanceInvoiceDetails } from "../types/maintenance";

interface MaintenanceInvoiceWidgetProps {
  invoice?: MaintenanceInvoiceDetails;
  onApproveInvoice?: () => void;
  userRole?: string;
}

export const MaintenanceInvoiceWidget: React.FC<MaintenanceInvoiceWidgetProps> = ({
  invoice,
  onApproveInvoice,
  userRole = "ROLE_PROPERTY_OWNER",
}) => {
  if (!invoice) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="font-heading text-xs font-bold text-foreground">
            Itemized Service Invoice (#{invoice.invoiceNumber})
          </h4>
        </div>
        <StatusBadge status={invoice.status === "APPROVED" ? "COMPLETED" : "PENDING"} />
      </div>

      {/* Items Table */}
      <div className="space-y-1 text-xs">
        {invoice.items.map((item) => (
          <div key={item.id} className="flex justify-between py-1 border-b border-border/20 text-muted-foreground">
            <span>{item.description}</span>
            <span className="font-semibold text-foreground">${item.amount}</span>
          </div>
        ))}

        <div className="flex justify-between font-bold text-sm text-foreground pt-2">
          <span>Total Billed Amount</span>
          <span className="text-primary">${invoice.total}</span>
        </div>
      </div>

      {invoice.status === "PENDING_APPROVAL" && userRole === "ROLE_PROPERTY_OWNER" && onApproveInvoice && (
        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="sm" onClick={onApproveInvoice} leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>
            Authorize Invoice Payout
          </Button>
        </div>
      )}
    </div>
  );
};
