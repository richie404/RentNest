import React from "react";
import { ShieldCheck } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { useAdminAuditLogsQuery } from "@/features/admin/hooks/useAdminData";

export const AdminAuditLogsPage: React.FC = () => {
  const { data: logs = [] } = useAdminAuditLogsQuery();

  const columns = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }: any) => <span className="font-mono text-[11px] text-muted-foreground">{row.original.timestamp}</span>,
    },
    {
      accessorKey: "actorEmail",
      header: "Actor Email",
      cell: ({ row }: any) => <span className="font-bold text-xs text-foreground">{row.original.actorEmail}</span>,
    },
    {
      accessorKey: "action",
      header: "Action Executed",
      cell: ({ row }: any) => <span className="font-semibold text-xs text-primary">{row.original.action}</span>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => (
        <span className="px-2 py-0.5 rounded-lg bg-card border border-border/50 text-[10px] font-bold text-muted-foreground">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "Origin IP",
      cell: ({ row }: any) => <span className="font-mono text-xs text-muted-foreground">{row.original.ipAddress}</span>,
    },
    {
      accessorKey: "details",
      header: "Audit Trail Details",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Security & Immutable Audit Trail Logs
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-time record of all administrative actions, property price edits, moderation decisions, and user role modifications.
        </p>
      </div>

      <DataTable data={logs} columns={columns} searchPlaceholder="Search audit log entries..." />
    </div>
  );
};

export default AdminAuditLogsPage;
