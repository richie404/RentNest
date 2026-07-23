import React from "react";
import { StatisticsWidget } from "@/components/business/StatisticsWidget";
import { AnalyticsChart } from "@/components/business/AnalyticsChart";
import { Eye, Users, FileCheck, DollarSign } from "lucide-react";
import { usePropertyAnalyticsQuery } from "@/features/property/hooks/useProperties";

export const PropertyAnalyticsPage: React.FC = () => {
  const { data: analytics } = usePropertyAnalyticsQuery(1);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Property Performance Analytics
        </h1>
        <p className="text-xs text-muted-foreground">
          Yield analytics, listing view impressions, and inquiry conversion metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsWidget
          title="Total Listing Views"
          value={analytics?.totalViews || 1420}
          percentageChange={12.4}
          icon={<Eye className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Tenant Inquiries"
          value={analytics?.totalInquiries || 84}
          percentageChange={8.1}
          icon={<Users className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Lease Applications"
          value={analytics?.applicationsSubmitted || 12}
          percentageChange={15.3}
          icon={<FileCheck className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Occupancy Rate"
          value={`${analytics?.occupancyRate || 98.4}%`}
          percentageChange={2.1}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <AnalyticsChart
        title="Monthly Rental Income ($)"
        subtitle="Gross rental yields collected over the past 6 months"
        data={analytics?.monthlyRevenue || []}
        type="area"
      />
    </div>
  );
};
