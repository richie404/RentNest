import React from "react";
import { Check, X, ShieldCheck } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useAdminPropertiesQuery, useModeratePropertyMutation } from "@/features/admin/hooks/useAdminData";
import { showToast } from "@/components/ui/Toast";

export const AdminPropertiesPage: React.FC = () => {
  const { data: properties = [] } = useAdminPropertiesQuery();
  const moderateMutation = useModeratePropertyMutation();

  const handleModerate = (id: string, status: "APPROVED" | "REJECTED") => {
    moderateMutation.mutate(
      { id, status },
      {
        onSuccess: () => {
          showToast.success("Moderation Complete", `Listing status set to ${status}.`);
        },
      }
    );
  };

  const columns = [
    {
      accessorKey: "title",
      header: "Property Listing Title",
      cell: ({ row }: any) => (
        <div>
          <span className="font-bold text-foreground block">{row.original.title}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.city} • Owner: {row.original.ownerName}</span>
        </div>
      ),
    },
    {
      accessorKey: "pricePerMonth",
      header: "Monthly Rent",
      cell: ({ row }: any) => <span className="font-bold text-foreground">${row.original.pricePerMonth}</span>,
    },
    {
      accessorKey: "safetyScore",
      header: "Safety Audit",
      cell: ({ row }: any) => (
        <span className="text-xs font-extrabold text-emerald-500 flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> {row.original.safetyScore}%
        </span>
      ),
    },
    {
      accessorKey: "moderationStatus",
      header: "Moderation Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.moderationStatus === "APPROVED" ? "ACTIVE" : row.original.moderationStatus} />,
    },
    {
      id: "actions",
      header: "Governance Actions",
      cell: ({ row }: any) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleModerate(p.id, "APPROVED")}
              leftIcon={<Check className="h-3 w-3 text-emerald-500" />}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleModerate(p.id, "REJECTED")}
              leftIcon={<X className="h-3 w-3 text-rose-500" />}
            >
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Property Listing Moderation Governance
        </h1>
        <p className="text-xs text-muted-foreground">
          Review owner listing submissions, verify deed ownership, audit safety compliance score, and approve listings.
        </p>
      </div>

      <DataTable data={properties} columns={columns} searchPlaceholder="Search property listings..." />
    </div>
  );
};

export default AdminPropertiesPage;
