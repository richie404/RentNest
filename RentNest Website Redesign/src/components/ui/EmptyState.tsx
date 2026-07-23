import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionButton?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Data Available",
  description = "There are currently no records to display in this view.",
  icon = <FolderOpen className="h-8 w-8 text-muted-foreground" />,
  actionButton,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/40 p-12 text-center shadow-inner",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
        {icon}
      </div>

      <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>

      {actionButton && <div className="mt-6">{actionButton}</div>}
    </div>
  );
};
