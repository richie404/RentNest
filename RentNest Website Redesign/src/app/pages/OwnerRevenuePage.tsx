import React from "react";
import { StatisticsWidget } from "@/components/business/StatisticsWidget";
import { AnalyticsChart } from "@/components/business/AnalyticsChart";
import { DollarSign, ArrowUpRight, Percent } from "lucide-react";
import { useOwnerRevenueQuery } from "@/features/owner/hooks/useOwnerData";

export const OwnerRevenuePage: React.FC = () => {
  const { data: revenue } = useOwnerRevenueQuery();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Financial Payouts & Revenue
        </h1>
        <p className="text-xs text-muted-foreground">
          Gross rental yield performance, management fee deductions, and bank ACH deposits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatisticsWidget
          title="Gross Collected Rent"
          value={`$${(revenue?.totalRevenue || 142500).toLocaleString()}`}
          percentageChange={14.2}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Net ACH Payout"
          value={`$${(revenue?.netPayout || 135375).toLocaleString()}`}
          percentageChange={12.8}
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Platform Fees (5%)"
          value={`$${(revenue?.platformFees || 7125).toLocaleString()}`}
          icon={<Percent className="h-5 w-5" />}
        />
      </div>

      <AnalyticsChart
        title="YTD Financial Growth"
        subtitle="Gross revenue trends before platform service fee deduction"
        data={revenue?.monthlyBreakdown || []}
        type="area"
      />
    </div>
  );
};
