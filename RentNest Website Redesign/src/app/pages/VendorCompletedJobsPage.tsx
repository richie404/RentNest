import React from "react";
import { CheckCircle2, DollarSign, Calendar, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useVendorCompletedJobsQuery } from "@/features/vendor/hooks/useVendorData";
import { BeforeAfterGallery } from "@/features/maintenance/components/BeforeAfterGallery";

export const VendorCompletedJobsPage: React.FC = () => {
  const { data: completedJobs } = useVendorCompletedJobsQuery();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Completed Jobs Archive & Audit
        </h1>
        <p className="text-xs text-muted-foreground">
          Historical ledger of signed-off repairs, before/after workmanship photos, and billed revenue.
        </p>
      </div>

      <div className="space-y-4">
        {completedJobs?.map((job) => (
          <Card key={job.id} variant="default" className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-500">#{job.ticketNumber}</span>
                <h3 className="font-heading text-base font-bold text-foreground">{job.issueTitle}</h3>
                <p className="text-xs text-muted-foreground">{job.propertyTitle} ({job.unitNumber})</p>
              </div>
              <StatusBadge status="COMPLETED" />
            </div>

            <BeforeAfterGallery
              media={{
                beforeUrl: job.beforeImage,
                afterUrl: job.afterImage,
                beforeNotes: "Initial inspection photos",
                afterNotes: "Final workmanship sign-off",
              }}
            />

            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/20 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-500" /> Completed on {job.scheduledDate}
              </span>
              <span className="font-bold text-foreground">Total Revenue: ${job.totalCost}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VendorCompletedJobsPage;
