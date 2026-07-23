export type TimeframeOption = "7D" | "30D" | "90D" | "YTD" | "1Y" | "ALL";

export interface AnalyticsFilterState {
  timeframe: TimeframeOption;
  propertyId?: string;
  category?: string;
}

export interface KpiMetric {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  trendPercentage?: number;
  trendDirection?: "up" | "down" | "neutral";
  targetText?: string;
}

export interface ChartSeries {
  name: string;
  value: number;
  secondaryValue?: number;
}

export interface HeatmapCell {
  xLabel: string;
  yLabel: string;
  density: number; // 0 to 100
  tooltipText: string;
}

export interface AnalyticsReportData {
  kpis: KpiMetric[];
  revenueData: ChartSeries[];
  occupancyData: ChartSeries[];
  categoryData: { name: string; value: number; color: string }[];
  heatmap: HeatmapCell[];
}
