import React from "react";
import { HelpCircle } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminSupportTicketsQuery } from "@/features/admin/hooks/useAdminData";

export const AdminSupportTicketsPage: React.FC = () => {
  const { data: tickets = [] } = useAdminSupportTicketsQuery();

  const columns = [
    {
      accessorKey: "ticketId",
      header: "Ticket Ref",
      cell: ({ row }: any) => <span className="font-mono text-xs font-bold text-primary">{row.original.ticketId}</span>,
    },
    {
      accessorKey: "subject",
      header: "Support Issue Subject",
      cell: ({ row }: any) => (
        <div>
          <span className="font-bold text-foreground block">{row.original.subject}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.userName} ({row.original.userRole})</span>
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: "Urgency",
      cell: ({ row }: any) => <span className="font-bold text-xs text-rose-500">{row.original.priority}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Opened Date",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Platform Customer Helpdesk & Support Tickets
        </h1>
        <p className="text-xs text-muted-foreground">
          Triage user helpdesk tickets, lease e-signature inquiries, and bank routing delays.
        </p>
      </div>

      <DataTable data={tickets} columns={columns} searchPlaceholder="Search support tickets..." />
    </div>
  );
};

export default AdminSupportTicketsPage;
