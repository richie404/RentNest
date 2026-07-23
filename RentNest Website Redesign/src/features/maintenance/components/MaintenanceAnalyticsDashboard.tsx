import React from "react";
import { AnalyticsChart } from "@/components/business/AnalyticsChart";
import { StatisticsWidget } from "@/components/business/StatisticsWidget";
import { Clock, Wrench, DollarSign, CheckCircle2 } from "lucide-react";

export const MaintenanceAnalyticsDashboard: React.FC = () => {
  const resolutionData = [
    { name: "Mon", value: 1.2 },
    { name: "Tue", value: 1.5 },
    { name: "Wed", value: 1.1 },
    { name: "Thu", value: 1.8 },
    { name: "Fri", value: 1.4 },
    { name: "Sat", value: 1.0 },
    { name: "Sun", value: 0.9 },
  ];

  const expenditureData = [
    { name: "Plumbing", value: 1450 },
    { name: "HVAC", value: 920 },
    { name: "Electrical", value: 680 },
    { name: "Appliance", value: 340 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsWidget
          title="Avg Ticket Resolution"
          value="1.4 Days"
          percentageChange={-12.5}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Total Repairs YTD"
          value="42 Jobs"
          timeframe="Across Portfolio"
          icon={<Wrench className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Maintenance Expenditure"
          value="$3,390"
          percentageChange={4.2}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatisticsWidget
          title="Vendor SLA On-Time"
          value="98.2%"
          timeframe="Zero Missed Deadlines"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Resolution Time Trend (Hours)"
          subtitle="Average hours to resolve reported maintenance requests"
          data={resolutionData}
          type="area"
          color="#3b82f6"
        />
        <AnalyticsChart
          title="Expenditure by Specialty Category ($)"
          subtitle="Capital maintenance expenditures grouped by issue category"
          data={expenditureData}
          type="bar"
          color="#10b981"
        />
      </div>
    </div>
  );
};
