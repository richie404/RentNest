import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string | number;
  title: string;
  timestamp: string;
  description?: string;
  status?: "completed" | "current" | "pending";
  icon?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className }) => {
  return (
    <div className={cn("space-y-6 relative pl-6 border-l border-border/50", className)}>
      {events.map((event) => {
        const isCompleted = event.status === "completed";
        const isCurrent = event.status === "current";

        return (
          <div key={event.id} className="relative group">
            {/* Bullet Point Circle */}
            <div
              className={cn(
                "absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background transition-colors",
                isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                isCurrent && "border-primary bg-primary text-white animate-pulse",
                !isCompleted && !isCurrent && "border-border text-muted-foreground"
              )}
            >
              {event.icon ? (
                event.icon
              ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">{event.title}</h4>
                <span className="text-[10px] text-muted-foreground">{event.timestamp}</span>
              </div>
              {event.description && (
                <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
