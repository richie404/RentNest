import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MOCK_PROPERTIES } from "@/features/property/data/mockProperties";
import { showToast } from "@/components/ui/Toast";

export const AdminPropertyModerationPage: React.FC = () => {
  const columns = [
    {
      accessorKey: "title",
      header: "Listing Title",
    },
    {
      accessorKey: "ownerName",
      header: "Landlord / Owner",
    },
    {
      accessorKey: "monthlyRent",
      header: "Rent Rate",
      cell: (info: any) => `$${info.getValue()?.toLocaleString()}`,
    },
    {
      accessorKey: "status",
      header: "Moderation Status",
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
    {
      id: "actions",
      header: "Moderation Actions",
      cell: (info: any) => (
        <div className="flex gap-2">
          <Button
            variant="success"
            size="sm"
            onClick={() => showToast.success("Listing Approved", `Property ${info.row.original.title} is now public.`)}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => showToast.error("Listing Rejected", `Property ${info.row.original.title} was rejected.`)}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Property Moderation Queue
        </h1>
        <p className="text-xs text-muted-foreground">
          Review new landlord listings, verify ownership titles, and approve public visibility.
        </p>
      </div>

      <DataTable data={MOCK_PROPERTIES} columns={columns} searchPlaceholder="Search moderation queue..." />
    </div>
  );
};
