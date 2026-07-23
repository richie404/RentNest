import React from "react";
import { Wrench, Flame, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { cn } from "../../lib/utils";

export type UrgencyLevel = "EMERGENCY" | "HIGH" | "MEDIUM" | "LOW";
export type MaintenanceStatus = "OPEN" | "DISPATCHED" | "IN_PROGRESS" | "COMPLETED";

interface MaintenanceTicketCardProps {
  ticketId: number;
  category: string;
  unitNumber: string;
  description: string;
  urgency: UrgencyLevel;
  status: MaintenanceStatus;
  permissionToEnter: boolean;
  createdAt: string;
  onTicketClick?: (id: number) => void;
  className?: string;
}

export const MaintenanceTicketCard: React.FC<MaintenanceTicketCardProps> = ({
  ticketId,
  category,
  unitNumber,
  description,
  urgency,
  status,
  permissionToEnter,
  createdAt,
  onTicketClick,
  className,
}) => {
  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case "EMERGENCY":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div
      onClick={() => onTicketClick && onTicketClick(ticketId)}
      className={cn(
        "cursor-pointer rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md",
        className
      )}
      role="article"
      aria-label={`Maintenance ticket #${ticketId}: ${category}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-mono font-medium text-muted-foreground">TICKET #{ticketId}</span>
            <h4 className="font-heading text-base font-bold text-foreground">{category}</h4>
          </div>
        </div>

        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider",
            getUrgencyBadge(urgency)
          )}
        >
          {urgency}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{description}</p>

      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>{createdAt}</span>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="text-muted-foreground">Unit:</span>
          <span className="font-semibold text-foreground">{unitNumber}</span>
        </div>
      </div>
    </div>
  );
};
