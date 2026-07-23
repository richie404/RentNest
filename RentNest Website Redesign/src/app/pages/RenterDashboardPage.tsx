import React from "react";
import { DollarSign, FileText, Wrench, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { StatisticsWidget } from "@/components/business/StatisticsWidget";
import { BookingStatusCard } from "@/components/ui/BookingStatusCard";
import { MaintenanceTicketCard } from "@/components/ui/MaintenanceTicketCard";
import { InvoiceCard } from "@/components/business/InvoiceCard";
import { useTenantInvoicesQuery, useTenantMaintenanceQuery } from "@/features/tenant/hooks/useTenantData";

export const RenterDashboardPage: React.FC = () => {
  const { data: invoices } = useTenantInvoicesQuery();
  const { data: tickets } = useTenantMaintenanceQuery();

  const activeInvoice = invoices?.[0];
  const activeTicket = tickets?.[0];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Resident Tenant Portal
        </h1>
        <p className="text-xs text-muted-foreground">
          Welcome back! Here is an overview of your active lease, upcoming rent invoices, and work orders.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsWidget
          title="Current Rent Due"
          value="$4,850"
          timeframe="Due August 1, 2026"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Active Lease Contract"
          value="12 Months"
          timeframe="Expires July 31, 2026"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Open Work Orders"
          value="1 Active"
          timeframe="Ticket #804 In Progress"
          icon={<Wrench className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Tenant Status"
          value="Verified"
          timeframe="Auto-Pay ACH Active"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-sm font-bold text-foreground">Upcoming Rent Invoice</h3>
            <Link to="/app/tenant/invoices" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {activeInvoice && (
            <InvoiceCard
              invoiceNumber={activeInvoice.invoiceNumber}
              amount={activeInvoice.amount}
              dueDate={activeInvoice.dueDate}
              status={activeInvoice.status === "COMPLETED" ? "COMPLETED" : "PENDING"}
              propertyTitle={activeInvoice.propertyTitle}
            />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-sm font-bold text-foreground">Active Work Order</h3>
            <Link to="/app/tenant/maintenance" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View Requests <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {activeTicket && (
            <MaintenanceTicketCard
              ticketNumber={activeTicket.id}
              category={activeTicket.category}
              priority={activeTicket.priority}
              title={activeTicket.title}
              description={activeTicket.description}
              submittedDate={activeTicket.submittedAt}
              status={activeTicket.status}
            />
          )}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-sm font-bold text-foreground mb-3">Current Active Lease</h3>
        <BookingStatusCard
          bookingId="LSE-9901"
          propertyName="Grand Horizon Luxury Penthouse"
          unitNumber="Suite 4501"
          checkInDate="2025-08-01"
          checkOutDate="2026-07-31"
          monthlyRent={4850}
          status="CONFIRMED"
        />
      </div>
    </div>
  );
};
