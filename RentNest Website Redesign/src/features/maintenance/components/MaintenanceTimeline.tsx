import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import type { MaintenanceTimelineStep } from "../types/maintenance";

interface MaintenanceTimelineProps {
  timeline?: MaintenanceTimelineStep[];
}

export const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-heading text-xs font-bold text-foreground">Audit Trail & Work Order Timeline</h4>
      <div className="relative border-l-2 border-border/50 ml-3 pl-4 space-y-4">
        {timeline.map((step, index) => (
          <div key={index} className="relative">
            {/* Circle Node */}
            <span
              className={`absolute -left-[23px] top-0 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-card ${
                step.completed ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {step.completed ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            </span>

            <div className="text-xs">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-foreground">{step.title}</h5>
                <span className="text-[10px] text-muted-foreground">{step.timestamp}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
