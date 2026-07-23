import React, { useState } from "react";
import { useVendorAnalyticsQuery } from "@/features/analytics/hooks/useAnalyticsData";
import { AnalyticsFilterBar } from "@/features/analytics/components/AnalyticsFilterBar";
import { KpiGrid } from "@/features/analytics/components/KpiGrid";
import { Charts } from "@/components/ui/Charts";
import { analyticsExportService } from "@/features/analytics/services/analyticsExportService";
import type { TimeframeOption } from "@/features/analytics/types";

export const VendorReportsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("YTD");
  const { data } = useVendorAnalyticsQuery(timeframe);

  const handleCSV = () => {
    if (!data) return;
    const headers = ["Month", "Billed Revenue ($)"];
    const rows = data.revenueData.map((d) => [d.name, d.value]);
    analyticsExportService.exportToCSV("Vendor_Revenue_Report", headers, rows);
  };

  const handlePDF = () => {
    analyticsExportService.exportToPDF("Vendor Business Performance Report", "Revenue & SLA Compliance Audit");
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Vendor Revenue & SLA Analytics
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitor work order revenue trends, SLA compliance rates, average turnaround, and rating benchmarks.
        </p>
      </div>

      <AnalyticsFilterBar
        title="Vendor Analytics"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onExportCSV={handleCSV}
        onExportPDF={handlePDF}
      />

      {data && <KpiGrid kpis={data.kpis} />}

      {data && (
        <div className="space-y-3">
          <h3 className="font-heading text-sm font-bold text-foreground">Billed Repair Work Revenue ($)</h3>
          <Charts data={data.revenueData} type="area" color="#10b981" height={280} />
        </div>
      )}
    </div>
  );
};

export default VendorReportsPage;
