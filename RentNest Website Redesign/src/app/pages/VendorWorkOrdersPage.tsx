import React, { useState } from "react";
import { Wrench, CheckCircle2, Phone, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useVendorJobsQuery, useUpdateJobStatusMutation } from "@/features/vendor/hooks/useVendorData";
import { showToast } from "@/components/ui/Toast";

export const VendorWorkOrdersPage: React.FC = () => {
  const { data: jobs } = useVendorJobsQuery();
  const updateStatusMutation = useUpdateJobStatusMutation();

  const handleUpdateStatus = (jobId: string, status: "IN_PROGRESS" | "COMPLETED") => {
    updateStatusMutation.mutate(
      { jobId, status },
      {
        onSuccess: () => {
          showToast.success("Work Order Updated", `Status updated to ${status}.`);
        },
      }
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Assigned Work Orders & Jobs
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage dispatched jobs, update technician progress, record labor hours, and complete repair tasks.
        </p>
      </div>

      <div className="space-y-4">
        {jobs?.map((job) => (
          <Card key={job.id} variant="default" className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/40 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">#{job.ticketNumber}</span>
                  <h3 className="font-heading text-base font-bold text-foreground">{job.issueTitle}</h3>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {job.propertyTitle} ({job.unitNumber}) • {job.address}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {job.status === "ASSIGNED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(job.id, "IN_PROGRESS")}
                    leftIcon={<Wrench className="h-3.5 w-3.5" />}
                  >
                    Start Work
                  </Button>
                )}

                {job.status === "IN_PROGRESS" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(job.id, "COMPLETED")}
                    leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  >
                    Mark Completed
                  </Button>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-background/50 p-3 rounded-2xl border border-border/30">
              {job.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-muted/20 p-3 rounded-2xl">
              <div>
                <span className="text-[10px] text-muted-foreground block">Tenant Contact</span>
                <strong className="text-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3 text-primary" /> {job.tenantName} ({job.tenantPhone})
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Scheduled Window</span>
                <strong className="text-foreground">{job.scheduledDate} ({job.scheduledTimeSlot})</strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Labor Rate / Hours</span>
                <strong className="text-foreground">${job.laborRate}/hr ({job.estimatedLaborHours} hrs)</strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Estimated Job Total</span>
                <strong className="text-primary font-bold">${job.totalCost}</strong>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VendorWorkOrdersPage;
