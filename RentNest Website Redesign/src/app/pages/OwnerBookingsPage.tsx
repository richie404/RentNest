import React from "react";
import { BookingStatusCard } from "@/components/ui/BookingStatusCard";

export const OwnerBookingsPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Tenant Lease Reservations
        </h1>
        <p className="text-xs text-muted-foreground">
          Confirmed lease bookings, move-in dates, and tenant security deposit holds.
        </p>
      </div>

      <div className="space-y-4">
        <BookingStatusCard
          bookingId="BKG-9901"
          propertyName="Grand Horizon Luxury Penthouse"
          unitNumber="Suite 4501"
          checkInDate="2025-08-01"
          checkOutDate="2026-07-31"
          monthlyRent={4850}
          status="CONFIRMED"
        />
        <BookingStatusCard
          bookingId="BKG-9902"
          propertyName="The Botanical Glass Loft"
          unitNumber="Unit 4B"
          checkInDate="2026-08-15"
          checkOutDate="2027-08-14"
          monthlyRent={3200}
          status="CONFIRMED"
        />
      </div>
    </div>
  );
};
