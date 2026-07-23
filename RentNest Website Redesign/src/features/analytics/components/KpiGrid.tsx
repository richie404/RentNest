import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { KpiMetric } from "../types";

interface KpiGridProps {
  kpis: KpiMetric[];
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const isUp = kpi.trendDirection === "up";
        const isDown = kpi.trendDirection === "down";

        return (
          <div
            key={kpi.id}
            className="p-5 rounded-2xl border border-border/50 bg-card/80 shadow-sm space-y-2 hover:border-primary/40 transition-all"
          >
            <span className="text-xs font-semibold text-muted-foreground block">{kpi.title}</span>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-2xl font-extrabold text-foreground">{kpi.value}</span>
              {kpi.trendPercentage !== undefined && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg ${
                    isUp
                      ? "text-emerald-500 bg-emerald-500/10"
                      : isDown
                      ? "text-rose-500 bg-rose-500/10"
                      : "text-muted-foreground bg-muted/40"
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : isDown ? (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                  <span>{Math.abs(kpi.trendPercentage)}%</span>
                </div>
              )}
            </div>
            {kpi.targetText && <span className="text-[10px] text-muted-foreground block">{kpi.targetText}</span>}
          </div>
        );
      })}
    </div>
  );
};
