import React from "react";
import type { HeatmapCell } from "../types";

interface HeatmapChartProps {
  cells: HeatmapCell[];
  title: string;
  subtitle?: string;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ cells, title, subtitle }) => {
  if (!cells || cells.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4 shadow-sm">
      <div>
        <h3 className="font-heading text-sm font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {cells.map((cell, idx) => {
          // Color intensity calculation
          const opacity = Math.max(0.2, cell.density / 100);

          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-primary/20 bg-primary text-white space-y-1 shadow-sm transition-transform hover:scale-105"
              style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
              title={cell.tooltipText}
            >
              <span className="text-[10px] uppercase font-bold text-white/80 block">{cell.xLabel}</span>
              <h4 className="font-heading text-xs font-bold text-white truncate">{cell.yLabel}</h4>
              <span className="text-xs font-extrabold text-white block">{cell.density}% Density</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
