import React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useTenantPaymentsQuery } from "@/features/tenant/hooks/useTenantData";

export const TenantPaymentsPage: React.FC = () => {
  const { data: payments } = useTenantPaymentsQuery();

  const columns = [
    {
      accessorKey: "paymentNumber",
      header: "Receipt #",
    },
    {
      accessorKey: "propertyTitle",
      header: "Property",
    },
    {
      accessorKey: "amount",
      header: "Amount Paid",
      cell: (info: any) => <span className="font-extrabold text-emerald-500">${info.getValue()?.toLocaleString()}</span>,
    },
    {
      accessorKey: "paymentDate",
      header: "Date Paid",
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => <StatusBadge status={info.getValue() === "COMPLETED" ? "APPROVED" : info.getValue()} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Rent Payment History
        </h1>
        <p className="text-xs text-muted-foreground">
          Complete ledger of monthly rent payments, processing receipts, and bank transfers.
        </p>
      </div>

      <DataTable data={payments || []} columns={columns} searchPlaceholder="Search payment history..." />
    </div>
  );
};
