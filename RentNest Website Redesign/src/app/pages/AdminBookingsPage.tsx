import React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminBookingsQuery } from "@/features/admin/hooks/useAdminData";

export const AdminBookingsPage: React.FC = () => {
  const { data: bookings = [] } = useAdminBookingsQuery();

  const columns = [
    {
      accessorKey: "bookingRef",
      header: "Booking Ref",
      cell: ({ row }: any) => <span className="font-mono text-xs font-bold text-primary">{row.original.bookingRef}</span>,
    },
    {
      accessorKey: "propertyTitle",
      header: "Property Listing",
      cell: ({ row }: any) => (
        <div>
          <span className="font-bold text-foreground block">{row.original.propertyTitle}</span>
          <span className="text-[10px] text-muted-foreground">Tenant: {row.original.tenantName} • Owner: {row.original.ownerName}</span>
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Lease Period",
      cell: ({ row }: any) => <span className="text-xs">{row.original.startDate} to {row.original.endDate}</span>,
    },
    {
      accessorKey: "totalAmount",
      header: "Contract Gross Value",
      cell: ({ row }: any) => <span className="font-extrabold text-foreground">${row.original.totalAmount}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status === "CONFIRMED" ? "ACTIVE" : row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Platform Lease Bookings Ledger
        </h1>
        <p className="text-xs text-muted-foreground">
          Comprehensive registry of active tenant leases, contract valuations, and lease status tracking.
        </p>
      </div>

      <DataTable data={bookings} columns={columns} searchPlaceholder="Search bookings by reference or tenant..." />
    </div>
  );
};

export default AdminBookingsPage;
