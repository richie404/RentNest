import React from "react";
import { Download, Printer, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { TimeframeOption } from "../types";
import { analyticsExportService } from "../services/analyticsExportService";

interface AnalyticsFilterBarProps {
  timeframe: TimeframeOption;
  onTimeframeChange: (t: TimeframeOption) => void;
  title: string;
  exportFilename?: string;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  timeframe,
  onTimeframeChange,
  title,
  onExportCSV,
  onExportPDF,
}) => {
  const timeframes: { label: string; value: TimeframeOption }[] = [
    { label: "7 Days", value: "7D" },
    { label: "30 Days", value: "30D" },
    { label: "90 Days", value: "90D" },
    { label: "YTD", value: "YTD" },
    { label: "All Time", value: "ALL" },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 p-4 rounded-2xl border border-border/40 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-primary" />
        <span className="font-heading text-xs font-bold text-foreground">Analytics Range:</span>
        <div className="flex items-center gap-1 bg-background/50 p-1 rounded-xl border border-border/50">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeframe === tf.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          leftIcon={<Download className="h-3.5 w-3.5" />}
        >
          Export CSV
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onExportPDF}
          leftIcon={<Printer className="h-3.5 w-3.5" />}
        >
          Print PDF Report
        </Button>
      </div>
    </div>
  );
};
