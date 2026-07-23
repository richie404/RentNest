import React, { useState } from "react";
import { useTenantAnalyticsQuery } from "@/features/analytics/hooks/useAnalyticsData";
import { AnalyticsFilterBar } from "@/features/analytics/components/AnalyticsFilterBar";
import { KpiGrid } from "@/features/analytics/components/KpiGrid";
import { Charts } from "@/components/ui/Charts";
import { analyticsExportService } from "@/features/analytics/services/analyticsExportService";
import type { TimeframeOption } from "@/features/analytics/types";

export const TenantAnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("YTD");
  const { data } = useTenantAnalyticsQuery(timeframe);

  const handleCSV = () => {
    if (!data) return;
    const headers = ["Month", "Rent Paid ($)"];
    const rows = data.revenueData.map((d) => [d.name, d.value]);
    analyticsExportService.exportToCSV("Tenant_Rent_History", headers, rows);
  };

  const handlePDF = () => {
    analyticsExportService.exportToPDF("Tenant Rent Financial Analytics", "RentNest Tenant Lease Summary");
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Tenant Rental & Expense Analytics
        </h1>
        <p className="text-xs text-muted-foreground">
          Track rent payments history, lease countdown, utility overhead, and maintenance turnaround stats.
        </p>
      </div>

      <AnalyticsFilterBar
        title="Tenant Analytics"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onExportCSV={handleCSV}
        onExportPDF={handlePDF}
      />

      {data && <KpiGrid kpis={data.kpis} />}

      {data && (
        <div className="space-y-3">
          <h3 className="font-heading text-sm font-bold text-foreground">Monthly Rent Payment History ($)</h3>
          <Charts data={data.revenueData} type="area" color="#3b82f6" height={280} />
        </div>
      )}
    </div>
  );
};

export default TenantAnalyticsPage;
