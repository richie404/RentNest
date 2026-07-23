import React from "react";
import { Calendar, DollarSign, Clock } from "lucide-react";
import { cn, formatCurrency } from "../../lib/utils";

export type BookingStatus = "APPROVED" | "PENDING" | "REJECTED" | "CANCELLED";

interface BookingStatusCardProps {
  bookingId: number;
  propertyTitle: string;
  unitNumber: string;
  startDate: string;
  endDate: string;
  totalRentAmount: number;
  status: BookingStatus;
  onViewDetails?: (id: number) => void;
  className?: string;
}

export const BookingStatusCard: React.FC<BookingStatusCardProps> = ({
  bookingId,
  propertyTitle,
  unitNumber,
  startDate,
  endDate,
  totalRentAmount,
  status,
  onViewDetails,
  className,
}) => {
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md",
        className
      )}
      role="article"
      aria-label={`Booking #${bookingId} for ${propertyTitle}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono font-medium text-muted-foreground">
            RESERVATION #{bookingId}
          </span>
          <h4 className="mt-1 font-heading text-lg font-bold text-foreground">
            {propertyTitle}
          </h4>
          <p className="text-xs text-muted-foreground">Unit: {unitNumber}</p>
        </div>

        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
            getStatusBadge(status)
          )}
        >
          {status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border/40 pt-4 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Term</p>
            <p className="font-medium text-foreground">{startDate} – {endDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rent Amount</p>
            <p className="font-mono font-bold text-foreground">{formatCurrency(totalRentAmount)}</p>
          </div>
        </div>
      </div>

      {onViewDetails && (
        <button
          onClick={() => onViewDetails(bookingId)}
          className="mt-4 w-full rounded-xl bg-secondary/50 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          View Reservation Details
        </button>
      )}
    </div>
  );
};
