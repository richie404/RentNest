import React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminPaymentsQuery } from "@/features/admin/hooks/useAdminData";

export const AdminPaymentsPage: React.FC = () => {
  const { data: payments = [] } = useAdminPaymentsQuery();

  const columns = [
    {
      accessorKey: "transactionRef",
      header: "Tx Ref",
      cell: ({ row }: any) => <span className="font-mono text-xs font-bold text-primary">{row.original.transactionRef}</span>,
    },
    {
      accessorKey: "payerName",
      header: "Flow",
      cell: ({ row }: any) => (
        <span className="text-xs">
          <strong>{row.original.payerName}</strong> → <strong>{row.original.recipientName}</strong>
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Gross Amount",
      cell: ({ row }: any) => <span className="font-extrabold text-foreground">${row.original.amount}</span>,
    },
    {
      accessorKey: "platformFee",
      header: "Platform Fee Yield",
      cell: ({ row }: any) => <span className="font-extrabold text-emerald-500">+${row.original.platformFee}</span>,
    },
    {
      accessorKey: "gateway",
      header: "Payment Gateway",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status === "SUCCESSFUL" ? "COMPLETED" : row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Platform Payment Clearinghouse
        </h1>
        <p className="text-xs text-muted-foreground">
          Audit global rental payments, gateway settlement status, and commission revenue fee yields.
        </p>
      </div>

      <DataTable data={payments} columns={columns} searchPlaceholder="Search payment transaction logs..." />
    </div>
  );
};

export default AdminPaymentsPage;
