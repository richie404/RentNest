import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../lib/utils";

interface MetricDashboardWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trendAmount?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export const MetricDashboardWidget: React.FC<MetricDashboardWidgetProps> = ({
  title,
  value,
  subtitle,
  trendAmount,
  trendDirection = "neutral",
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20",
        className
      )}
      role="region"
      aria-label={`Metric widget: ${title}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="font-heading text-3xl font-bold tracking-tight text-foreground font-mono">
          {value}
        </h3>

        {trendAmount && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              trendDirection === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              trendDirection === "down" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              trendDirection === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {trendDirection === "up" && <TrendingUp className="h-3.5 w-3.5" />}
            {trendDirection === "down" && <TrendingDown className="h-3.5 w-3.5" />}
            {trendDirection === "neutral" && <Minus className="h-3.5 w-3.5" />}
            <span>{trendAmount}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
};
