import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "../ui/Card";
import { cn } from "@/lib/utils";

export interface StatisticsWidgetProps {
  title: string;
  value: string | number;
  percentageChange?: number;
  timeframe?: string;
  icon?: React.ReactNode;
  variant?: "default" | "glass" | "gradient";
}

export const StatisticsWidget: React.FC<StatisticsWidgetProps> = ({
  title,
  value,
  percentageChange,
  timeframe = "vs last month",
  icon,
  variant = "default",
}) => {
  const isPositive = (percentageChange || 0) >= 0;

  return (
    <Card variant={variant} className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        {icon && <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>}
      </div>

      <div className="mt-3">
        <h3 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">{value}</h3>
      </div>

      {percentageChange !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md text-[11px]",
              isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            )}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(percentageChange)}%
          </span>
          <span className="text-[10px] text-muted-foreground">{timeframe}</span>
        </div>
      )}
    </Card>
  );
};
