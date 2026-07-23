import React, { useState } from "react";
import { useOwnerAnalyticsQuery } from "@/features/analytics/hooks/useAnalyticsData";
import { AnalyticsFilterBar } from "@/features/analytics/components/AnalyticsFilterBar";
import { KpiGrid } from "@/features/analytics/components/KpiGrid";
import { HeatmapChart } from "@/features/analytics/components/HeatmapChart";
import { Charts } from "@/components/ui/Charts";
import { analyticsExportService } from "@/features/analytics/services/analyticsExportService";
import type { TimeframeOption } from "@/features/analytics/types";

export const OwnerReportsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("YTD");
  const { data } = useOwnerAnalyticsQuery(timeframe);

  const handleCSV = () => {
    if (!data) return;
    const headers = ["Month", "Gross Revenue ($)", "Net Profit ($)"];
    const rows = data.revenueData.map((d) => [d.name, d.value, d.secondaryValue || 0]);
    analyticsExportService.exportToCSV("Owner_Financial_Report", headers, rows);
  };

  const handlePDF = () => {
    analyticsExportService.exportToPDF("Owner Portfolio Financial Statement", "Gross Rental Income & Yield Audit");
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Financial & Portfolio Analytics Reports
        </h1>
        <p className="text-xs text-muted-foreground">
          Deep-dive into Gross Rental Income, Net Profit Yield %, Occupancy Density, and Booking Velocity.
        </p>
      </div>

      <AnalyticsFilterBar
        title="Owner Financial Reports"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onExportCSV={handleCSV}
        onExportPDF={handlePDF}
      />

      {data && <KpiGrid kpis={data.kpis} />}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-heading text-sm font-bold text-foreground">Gross Rental Income Trend ($)</h3>
            <Charts data={data.revenueData} type="area" color="#3b82f6" height={280} />
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-sm font-bold text-foreground">Portfolio Occupancy Percentage (%)</h3>
            <Charts data={data.occupancyData} type="bar" color="#10b981" height={280} />
          </div>
        </div>
      )}

      {data && (
        <HeatmapChart
          title="Regional Property Occupancy Density Heatmap"
          subtitle="Real-time occupancy saturation across key market areas"
          cells={data.heatmap}
        />
      )}
    </div>
  );
};

export default OwnerReportsPage;
