import React from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Wrench } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useVendorJobsQuery } from "@/features/vendor/hooks/useVendorData";

export const VendorCalendarPage: React.FC = () => {
  const { data: jobs } = useVendorJobsQuery();

  const timeSlots = ["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"];
  const days = ["Mon, Aug 02", "Tue, Aug 03", "Wed, Aug 04", "Thu, Aug 05", "Fri, Aug 06"];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Vendor Service Dispatch Calendar
        </h1>
        <p className="text-xs text-muted-foreground">
          Visual schedule matrix of technician visits, scheduled work orders, and emergency callouts.
        </p>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[700px] grid grid-cols-6 gap-3 text-center">
          {/* Header Row */}
          <div className="p-3 font-heading text-xs font-bold text-muted-foreground border-b border-border/40">
            Time Slot
          </div>
          {days.map((day) => (
            <div key={day} className="p-3 font-heading text-xs font-bold text-foreground border-b border-border/40">
              {day}
            </div>
          ))}

          {/* Time Slots Rows */}
          {timeSlots.map((slot) => (
            <React.Fragment key={slot}>
              <div className="p-4 text-xs font-bold text-muted-foreground flex items-center justify-center border-b border-border/20 bg-muted/20 rounded-xl">
                {slot}
              </div>

              {days.map((day, idx) => {
                const hasJob = idx === 0 && slot === "10:00 AM";
                const job = hasJob ? jobs?.[0] : null;

                return (
                  <div
                    key={day + slot}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      job
                        ? "border-primary/50 bg-primary/10 shadow-sm"
                        : "border-border/20 bg-background/40 hover:bg-muted/30"
                    }`}
                  >
                    {job ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-primary">#{job.ticketNumber}</span>
                          <Wrench className="h-3 w-3 text-primary" />
                        </div>
                        <h5 className="font-heading text-[11px] font-bold text-foreground truncate">
                          {job.issueTitle}
                        </h5>
                        <p className="text-[10px] text-muted-foreground truncate">{job.propertyTitle}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/40 self-center my-auto">Available</span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorCalendarPage;
