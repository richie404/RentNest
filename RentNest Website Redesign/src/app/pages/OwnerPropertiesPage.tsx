import React from "react";
import { Plus, Building2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MOCK_PROPERTIES } from "@/features/property/data/mockProperties";

export const OwnerPropertiesPage: React.FC = () => {
  const columns = [
    {
      accessorKey: "title",
      header: "Property Title",
      cell: (info: any) => (
        <div className="font-bold text-foreground">{info.getValue()}</div>
      ),
    },
    {
      accessorKey: "propertyType",
      header: "Type",
      cell: (info: any) => <span className="text-xs text-muted-foreground">{info.getValue()}</span>,
    },
    {
      accessorKey: "monthlyRent",
      header: "Monthly Rent",
      cell: (info: any) => (
        <span className="font-extrabold text-primary">${info.getValue()?.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
            My Managed Portfolio
          </h1>
          <p className="text-xs text-muted-foreground">
            Overview of your active real estate listings, vacancy status, and rent rates.
          </p>
        </div>

        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
          Add New Property
        </Button>
      </div>

      <DataTable data={MOCK_PROPERTIES} columns={columns} searchPlaceholder="Search portfolio listings..." />
    </div>
  );
};
