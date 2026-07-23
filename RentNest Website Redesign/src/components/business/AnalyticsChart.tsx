import React from "react";
import { Charts, type ChartDataPoint } from "../ui/Charts";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/Card";

export interface AnalyticsChartProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  type?: "area" | "bar";
  height?: number;
  color?: string;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  subtitle,
  data,
  type = "area",
  height = 280,
  color = "#3b82f6",
}) => {
  return (
    <Card variant="default" className="p-5 space-y-4">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>

      <Charts data={data} type={type} height={height} color={color} />
    </Card>
  );
};
