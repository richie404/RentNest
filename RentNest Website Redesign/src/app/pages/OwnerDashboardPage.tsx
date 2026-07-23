import React from "react";
import { DollarSign, Building2, Users, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { StatisticsWidget } from "@/components/business/StatisticsWidget";
import { AnalyticsChart } from "@/components/business/AnalyticsChart";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useOwnerRevenueQuery, useOwnerApprovalsQuery } from "@/features/owner/hooks/useOwnerData";

export const OwnerDashboardPage: React.FC = () => {
  const { data: revenue } = useOwnerRevenueQuery();
  const { data: approvals } = useOwnerApprovalsQuery();

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Landlord Executive Dashboard
        </h1>
        <p className="text-xs text-muted-foreground">
          High-level overview of portfolio occupancy, gross rental yields, lease approvals, and revenue payouts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsWidget
          title="Total Gross Revenue"
          value={`$${(revenue?.totalRevenue || 142500).toLocaleString()}`}
          percentageChange={14.2}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Portfolio Occupancy"
          value={`${revenue?.occupancyRate || 96.8}%`}
          percentageChange={3.1}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Net Owner Payout"
          value={`$${(revenue?.netPayout || 135375).toLocaleString()}`}
          percentageChange={12.8}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Pending Approvals"
          value={`${approvals?.length || 2} Requests`}
          timeframe="Requires Action"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <AnalyticsChart
        title="Portfolio Revenue Performance ($)"
        subtitle="Gross rental payouts collected across all active property units"
        data={revenue?.monthlyBreakdown || []}
        type="area"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-foreground">Pending Lease Applicant Approvals</h3>
          <Link to="/app/owner/approvals" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            View All Requests <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvals?.map((app) => (
            <Card key={app.id} variant="default" className="p-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h4 className="font-heading text-xs font-bold text-foreground">{app.applicantName}</h4>
                  <p className="text-[10px] text-muted-foreground">{app.propertyTitle}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Credit Score: {app.applicantCreditScore}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span>Proposed Rent: <strong className="text-primary">${app.proposedRent}/mo</strong></span>
                <span>Move-in: <strong>{app.moveInDate}</strong></span>
              </div>

              <div className="mt-4 pt-3 border-t border-border/30 flex gap-2 justify-end">
                <Button variant="outline" size="sm">Decline</Button>
                <Button variant="primary" size="sm" leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>Approve Lease</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
