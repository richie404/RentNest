import React from "react";
import { NotificationCard } from "@/components/business/NotificationCard";

export const TenantNotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Notifications & System Alerts
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-time updates regarding payments, work orders, lease contracts, and property announcements.
        </p>
      </div>

      <div className="space-y-3 max-w-3xl">
        <NotificationCard
          title="Rent Payment Received"
          message="Monthly payment of $4,850 for Grand Horizon Penthouse was processed successfully."
          timestamp="10 mins ago"
          type="success"
          unread
        />
        <NotificationCard
          title="Work Order Status Updated"
          message="Vendor 'Apex Plumbing' dispatched to inspect Ticket #804."
          timestamp="1 hour ago"
          type="info"
          unread
        />
        <NotificationCard
          title="Lease Renewal Offer Available"
          message="Landlord has generated a 12-month lease renewal offer for your review."
          timestamp="Yesterday"
          type="warning"
          unread={false}
          actionText="Review Renewal Terms"
          onAction={() => {}}
        />
      </div>
    </div>
  );
};
