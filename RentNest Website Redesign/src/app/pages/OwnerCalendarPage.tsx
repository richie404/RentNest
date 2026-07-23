import React from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useOwnerCalendarQuery } from "@/features/owner/hooks/useOwnerData";

export const OwnerCalendarPage: React.FC = () => {
  const { data: events } = useOwnerCalendarQuery();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Portfolio Property Calendar
        </h1>
        <p className="text-xs text-muted-foreground">
          Schedule view of upcoming rent collection dates, lease expiration milestones, and inspections.
        </p>
      </div>

      <div className="space-y-3">
        {events?.map((evt) => (
          <Card key={evt.id} variant="default" className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-heading text-xs font-bold text-foreground">{evt.title}</h4>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> <span>{evt.date}</span>
                </div>
              </div>
            </div>

            <Badge variant="secondary" className="text-[10px]">
              {evt.type}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
};
