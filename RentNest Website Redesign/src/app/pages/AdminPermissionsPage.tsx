import React from "react";
import { Key } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { useAdminPermissionsQuery } from "@/features/admin/hooks/useAdminData";

export const AdminPermissionsPage: React.FC = () => {
  const { data: permissions = [] } = useAdminPermissionsQuery();

  const columns = [
    {
      accessorKey: "code",
      header: "Permission Code",
      cell: ({ row }: any) => <span className="font-mono text-xs font-bold text-primary">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Title",
    },
    {
      accessorKey: "module",
      header: "Target Module",
      cell: ({ row }: any) => <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">{row.original.module}</span>,
    },
    {
      accessorKey: "description",
      header: "Scope Description",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          System Permissions Registry
        </h1>
        <p className="text-xs text-muted-foreground">
          Granular API endpoints and capability flags controlling administrative system actions.
        </p>
      </div>

      <DataTable data={permissions} columns={columns} searchPlaceholder="Search permissions..." />
    </div>
  );
};

export default AdminPermissionsPage;
