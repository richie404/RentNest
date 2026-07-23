import React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminMaintenanceQuery } from "@/features/admin/hooks/useAdminData";

export const AdminMaintenancePage: React.FC = () => {
  const { data: tickets = [] } = useAdminMaintenanceQuery();

  const columns = [
    {
      accessorKey: "ticketNumber",
      header: "Ticket Ref",
      cell: ({ row }: any) => <span className="font-mono text-xs font-bold text-primary">#{row.original.ticketNumber}</span>,
    },
    {
      accessorKey: "propertyTitle",
      header: "Property / Parties",
      cell: ({ row }: any) => (
        <div>
          <span className="font-bold text-foreground block">{row.original.propertyTitle}</span>
          <span className="text-[10px] text-muted-foreground">Tenant: {row.original.tenantName} • Vendor: {row.original.vendorName}</span>
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority Level",
      cell: ({ row }: any) => <span className="font-extrabold text-xs text-rose-500">{row.original.priority}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Platform Maintenance & SLA Governance
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitor platform-wide repair work orders, SLA breach compliance, and vendor dispatch performance.
        </p>
      </div>

      <DataTable data={tickets} columns={columns} searchPlaceholder="Search maintenance tickets..." />
    </div>
  );
};

export default AdminMaintenancePage;
