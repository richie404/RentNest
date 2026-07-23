import React from "react";
import { Users, UserX, UserCheck } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useAdminUsersQuery, useUpdateUserStatusMutation } from "@/features/admin/hooks/useAdminData";
import { showToast } from "@/components/ui/Toast";
import type { AdminUser } from "@/features/admin/types/admin";

export const AdminUsersPage: React.FC = () => {
  const { data: users = [], isLoading } = useAdminUsersQuery();
  const updateStatusMutation = useUpdateUserStatusMutation();

  const handleStatus = (userId: string, status: AdminUser["status"]) => {
    updateStatusMutation.mutate(
      { userId, status },
      {
        onSuccess: () => {
          showToast.success("User Updated", `Account status changed to ${status}.`);
        },
      }
    );
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Full Name",
      cell: ({ row }: any) => (
        <div>
          <span className="font-bold text-foreground block">{row.original.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Platform Role",
      cell: ({ row }: any) => (
        <span className="font-semibold text-xs text-primary">
          {row.original.role.replace("ROLE_", "")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "joinedDate",
      header: "Member Since",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-1">
            {u.status === "ACTIVE" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatus(u.id, "SUSPENDED")}
                leftIcon={<UserX className="h-3 w-3 text-rose-500" />}
              >
                Suspend
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatus(u.id, "ACTIVE")}
                leftIcon={<UserCheck className="h-3 w-3 text-emerald-500" />}
              >
                Activate
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Platform Identity & User Management
        </h1>
        <p className="text-xs text-muted-foreground">
          Governance over registered tenants, property owners, maintenance vendors, and support staff accounts.
        </p>
      </div>

      <DataTable data={users} columns={columns} searchPlaceholder="Search users by name or email..." />
    </div>
  );
};

export default AdminUsersPage;
