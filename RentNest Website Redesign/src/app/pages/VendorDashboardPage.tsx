import React from "react";
import { Wrench, CheckCircle2, DollarSign, Star, Calendar } from "lucide-react";
import { StatisticsWidget } from "@/components/business/StatisticsWidget";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Charts } from "@/components/ui/Charts";
import {
  useVendorJobsQuery,
  useVendorCompletedJobsQuery,
  useVendorInvoicesQuery,
  useVendorRatingsQuery,
} from "@/features/vendor/hooks/useVendorData";
import { useNavigate } from "react-router";

export const VendorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: assignedJobs } = useVendorJobsQuery();
  const { data: completedJobs } = useVendorCompletedJobsQuery();
  const { data: invoices } = useVendorInvoicesQuery();
  const { data: ratings } = useVendorRatingsQuery();

  const revenueSeries = [
    { name: "Mon", value: 450 },
    { name: "Tue", value: 890 },
    { name: "Wed", value: 1200 },
    { name: "Thu", value: 1650 },
    { name: "Fri", value: 2100 },
    { name: "Sat", value: 2450 },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Vendor Service Command Center
        </h1>
        <p className="text-xs text-muted-foreground">
          Dispatch dispatch queue, active work orders, billing invoices, and customer satisfaction metrics.
        </p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsWidget
          title="Assigned Jobs"
          value={assignedJobs?.length || 0}
          timeframe="Ready for dispatch"
          icon={<Wrench className="h-5 w-5 text-primary" />}
        />
        <StatisticsWidget
          title="Completed Jobs"
          value={completedJobs?.length || 0}
          timeframe="Signed off"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        />
        <StatisticsWidget
          title="Pending Invoices"
          value={`$${invoices?.filter((i) => i.status === "PENDING").reduce((acc, i) => acc + i.amountBilled, 0) || 0}`}
          timeframe="Awaiting owner approval"
          icon={<DollarSign className="h-5 w-5 text-amber-500" />}
        />
        <StatisticsWidget
          title="Rating Average"
          value={`${ratings?.averageRating || 5.0} ★`}
          timeframe={`Across ${ratings?.totalReviews || 0} reviews`}
          icon={<Star className="h-5 w-5 text-amber-400" />}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Dispatch Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-bold text-foreground">Active Work Orders Queue</h3>
            <Button variant="outline" size="sm" onClick={() => navigate("/vendor/jobs")}>
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {assignedJobs?.map((job) => (
              <Card key={job.id} variant="default" className="p-4 space-y-3 hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-primary">#{job.ticketNumber}</span>
                    <h4 className="font-heading text-sm font-bold text-foreground">{job.issueTitle}</h4>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                <p className="text-xs text-muted-foreground">{job.propertyTitle} ({job.unitNumber})</p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border/20 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> {job.scheduledDate} ({job.scheduledTimeSlot})
                  </span>
                  <span className="font-bold text-foreground">${job.totalCost}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Weekly Revenue Trend */}
        <div className="space-y-4">
          <h3 className="font-heading text-base font-bold text-foreground">Weekly Revenue Earnings ($)</h3>
          <Charts data={revenueSeries} type="area" color="#10b981" height={260} />
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
