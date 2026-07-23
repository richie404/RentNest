import React from "react";
import { InvoiceCard } from "@/components/business/InvoiceCard";
import { useTenantInvoicesQuery } from "@/features/tenant/hooks/useTenantData";

export const TenantInvoicesPage: React.FC = () => {
  const { data: invoices } = useTenantInvoicesQuery();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Monthly Rent Invoices
        </h1>
        <p className="text-xs text-muted-foreground">
          Pending statements, monthly rent due dates, and breakdown receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {invoices?.map((inv) => (
          <InvoiceCard
            key={inv.id}
            invoiceNumber={inv.invoiceNumber}
            amount={inv.amount}
            dueDate={inv.dueDate}
            status={inv.status === "COMPLETED" ? "COMPLETED" : "PENDING"}
            propertyTitle={inv.propertyTitle}
          />
        ))}
      </div>
    </div>
  );
};
