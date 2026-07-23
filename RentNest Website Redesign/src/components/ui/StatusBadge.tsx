import React from "react";
import { cn } from "@/lib/utils";

export type DomainStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "CANCELLED"
  | "OPEN"
  | "DISPATCHED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "EMERGENCY"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

interface StatusBadgeProps {
  status: DomainStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStyles = () => {
    switch (status) {
      case "APPROVED":
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "PENDING":
      case "DISPATCHED":
      case "IN_PROGRESS":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "REJECTED":
      case "CANCELLED":
      case "EMERGENCY":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        getStyles(),
        className
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
};
