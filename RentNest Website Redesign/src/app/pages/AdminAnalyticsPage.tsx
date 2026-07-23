import React, { useState } from "react";
import { useAdminAnalyticsQuery } from "@/features/analytics/hooks/useAnalyticsData";
import { AnalyticsFilterBar } from "@/features/analytics/components/AnalyticsFilterBar";
import { KpiGrid } from "@/features/analytics/components/KpiGrid";
import { HeatmapChart } from "@/features/analytics/components/HeatmapChart";
import { Charts } from "@/components/ui/Charts";
import { analyticsExportService } from "@/features/analytics/services/analyticsExportService";
import type { TimeframeOption } from "@/features/analytics/types";

export const AdminAnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("YTD");
  const { data } = useAdminAnalyticsQuery(timeframe);

  const handleCSV = () => {
    if (!data) return;
    const headers = ["Month", "Gross Booking Value ($M)", "Platform MRR ($M)"];
    const rows = data.revenueData.map((d) => [d.name, d.value, d.secondaryValue || 0]);
    analyticsExportService.exportToCSV("Platform_Executive_Analytics", headers, rows);
  };

  const handlePDF = () => {
    analyticsExportService.exportToPDF("RentNest Executive Board Report", "Platform Financial Growth & Geographic Density");
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Platform Governance & Financial Analytics
        </h1>
        <p className="text-xs text-muted-foreground">
          Executive reporting suite covering GBV (Gross Booking Value), MRR (Monthly Recurring Revenue), MoM growth, and density heatmaps.
        </p>
      </div>

      <AnalyticsFilterBar
        title="Admin Executive Analytics"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onExportCSV={handleCSV}
        onExportPDF={handlePDF}
      />

      {data && <KpiGrid kpis={data.kpis} />}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-heading text-sm font-bold text-foreground">Gross Booking Value ($ Millions)</h3>
            <Charts data={data.revenueData} type="area" color="#8b5cf6" height={280} />
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-sm font-bold text-foreground">Active Ecosystem User Distribution</h3>
            <Charts data={data.occupancyData} type="bar" color="#3b82f6" height={280} />
          </div>
        </div>
      )}

      {data && (
        <HeatmapChart
          title="Geographic Property & Demand Density"
          subtitle="Top metro regional distribution of active listings and tenant search volume"
          cells={data.heatmap}
        />
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
