import React from "react";
import { BookingStatusCard } from "@/components/ui/BookingStatusCard";
import { useTenantBookingsQuery } from "@/features/tenant/hooks/useTenantData";

export const TenantBookingsPage: React.FC = () => {
  const { data: bookings } = useTenantBookingsQuery();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          My Property Bookings
        </h1>
        <p className="text-xs text-muted-foreground">
          Confirmed lease reservations, move-in schedules, and active stay details.
        </p>
      </div>

      <div className="space-y-4">
        {bookings?.map((b) => (
          <BookingStatusCard
            key={b.id}
            bookingId={b.id}
            propertyName={b.propertyTitle}
            unitNumber="Unit 402"
            checkInDate={b.checkInDate}
            checkOutDate={b.checkOutDate}
            monthlyRent={b.totalPaid / 12}
            status={b.status}
          />
        ))}
      </div>
    </div>
  );
};
