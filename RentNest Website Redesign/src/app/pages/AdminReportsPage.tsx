import React, { useState } from "react";
import { useAdminAnalyticsQuery } from "@/features/analytics/hooks/useAnalyticsData";
import { AnalyticsFilterBar } from "@/features/analytics/components/AnalyticsFilterBar";
import { KpiGrid } from "@/features/analytics/components/KpiGrid";
import { analyticsExportService } from "@/features/analytics/services/analyticsExportService";
import type { TimeframeOption } from "@/features/analytics/types";

export const AdminReportsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("YTD");
  const { data } = useAdminAnalyticsQuery(timeframe);

  const handleCSV = () => {
    if (!data) return;
    const headers = ["Metric Title", "Value"];
    const rows = data.kpis.map((k) => [k.title, k.value]);
    analyticsExportService.exportToCSV("Admin_Executive_Audit", headers, rows);
  };

  const handlePDF = () => {
    analyticsExportService.exportToPDF("Admin Ecosystem Governance Report", "Platform Compliance & Financial Performance");
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Platform Governance Reports & Audits
        </h1>
        <p className="text-xs text-muted-foreground">
          Generate platform audit reports, export raw financial datasets, and view compliance executive summaries.
        </p>
      </div>

      <AnalyticsFilterBar
        title="Admin Governance Reports"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onExportCSV={handleCSV}
        onExportPDF={handlePDF}
      />

      {data && <KpiGrid kpis={data.kpis} />}
    </div>
  );
};

export default AdminReportsPage;
