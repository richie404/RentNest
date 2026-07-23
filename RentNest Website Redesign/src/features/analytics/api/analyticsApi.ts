import type { AnalyticsReportData, TimeframeOption } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsApi = {
  getTenantAnalytics: async (timeframe: TimeframeOption): Promise<AnalyticsReportData> => {
    await delay(250);
    return {
      kpis: [
        { id: "1", title: "Total Rent Paid YTD", value: "$18,000", trendPercentage: 0, trendDirection: "neutral", targetText: "100% On-Time" },
        { id: "2", title: "Active Lease Term", value: "8 Months", targetText: "Expires July 2027" },
        { id: "3", title: "Maintenance Tickets", value: "3 Resolved", trendPercentage: 100, trendDirection: "up", targetText: "Avg resolution 1.2 days" },
      ],
      revenueData: [
        { name: "Jan", value: 1500 },
        { name: "Feb", value: 1500 },
        { name: "Mar", value: 1500 },
        { name: "Apr", value: 1500 },
        { name: "May", value: 1500 },
        { name: "Jun", value: 1500 },
      ],
      occupancyData: [],
      categoryData: [
        { name: "Rent Payouts", value: 85, color: "#3b82f6" },
        { name: "Utilities & Fees", value: 10, color: "#10b981" },
        { name: "Maintenance", value: 5, color: "#f59e0b" },
      ],
      heatmap: [],
    };
  },

  getOwnerAnalytics: async (timeframe: TimeframeOption): Promise<AnalyticsReportData> => {
    await delay(300);
    return {
      kpis: [
        { id: "1", title: "Gross Rental Income", value: "$48,500", trendPercentage: 14.2, trendDirection: "up", targetText: "vs last period" },
        { id: "2", title: "Net Portfolio Yield", value: "8.4%", trendPercentage: 1.2, trendDirection: "up", targetText: "Target 8.0%" },
        { id: "3", title: "Occupancy Rate", value: "96.5%", trendPercentage: 2.1, trendDirection: "up", targetText: "2 Vacant Units" },
        { id: "4", title: "Booking Velocity", value: "14 Days", trendPercentage: -18, trendDirection: "up", targetText: "Time to Lease" },
      ],
      revenueData: [
        { name: "Jan", value: 38000, secondaryValue: 29000 },
        { name: "Feb", value: 41000, secondaryValue: 31000 },
        { name: "Mar", value: 44000, secondaryValue: 34000 },
        { name: "Apr", value: 42000, secondaryValue: 32000 },
        { name: "May", value: 46000, secondaryValue: 36000 },
        { name: "Jun", value: 48500, secondaryValue: 38500 },
      ],
      occupancyData: [
        { name: "Jan", value: 92 },
        { name: "Feb", value: 94 },
        { name: "Mar", value: 95 },
        { name: "Apr", value: 96 },
        { name: "May", value: 95 },
        { name: "Jun", value: 96.5 },
      ],
      categoryData: [
        { name: "Luxury Penthouses", value: 45, color: "#3b82f6" },
        { name: "Urban Lofts", value: 30, color: "#10b981" },
        { name: "Villas & Suburban", value: 25, color: "#8b5cf6" },
      ],
      heatmap: [
        { xLabel: "Mon", yLabel: "NY Downtown", density: 85, tooltipText: "85% Occupied" },
        { xLabel: "Mon", yLabel: "LA Westside", density: 92, tooltipText: "92% Occupied" },
        { xLabel: "Wed", yLabel: "NY Downtown", density: 90, tooltipText: "90% Occupied" },
        { xLabel: "Fri", yLabel: "Miami Beach", density: 98, tooltipText: "98% Occupied" },
      ],
    };
  },

  getVendorAnalytics: async (timeframe: TimeframeOption): Promise<AnalyticsReportData> => {
    await delay(300);
    return {
      kpis: [
        { id: "1", title: "Billed Work Revenue", value: "$12,400", trendPercentage: 18.4, trendDirection: "up" },
        { id: "2", title: "SLA Response Rate", value: "100%", trendPercentage: 0, trendDirection: "neutral" },
        { id: "3", title: "Avg Turnaround", value: "1.4 Hours", trendPercentage: -12, trendDirection: "up" },
        { id: "4", title: "Customer Rating", value: "4.9 ★", trendPercentage: 0.2, trendDirection: "up" },
      ],
      revenueData: [
        { name: "Jan", value: 8200 },
        { name: "Feb", value: 9400 },
        { name: "Mar", value: 10100 },
        { name: "Apr", value: 11200 },
        { name: "May", value: 11800 },
        { name: "Jun", value: 12400 },
      ],
      occupancyData: [],
      categoryData: [
        { name: "Plumbing", value: 60, color: "#3b82f6" },
        { name: "HVAC", value: 25, color: "#10b981" },
        { name: "Electrical", value: 15, color: "#f59e0b" },
      ],
      heatmap: [],
    };
  },

  getAdminAnalytics: async (timeframe: TimeframeOption): Promise<AnalyticsReportData> => {
    await delay(350);
    return {
      kpis: [
        { id: "1", title: "Platform Gross Booking Value", value: "$4.2M", trendPercentage: 22.8, trendDirection: "up" },
        { id: "2", title: "Monthly Recurring Revenue", value: "$210K", trendPercentage: 16.5, trendDirection: "up" },
        { id: "3", title: "Active Users Count", value: "14,280", trendPercentage: 8.4, trendDirection: "up" },
        { id: "4", title: "System Uptime", value: "99.98%", trendPercentage: 0, trendDirection: "neutral" },
      ],
      revenueData: [
        { name: "Jan", value: 3.1, secondaryValue: 0.15 },
        { name: "Feb", value: 3.4, secondaryValue: 0.17 },
        { name: "Mar", value: 3.7, secondaryValue: 0.18 },
        { name: "Apr", value: 3.9, secondaryValue: 0.19 },
        { name: "May", value: 4.1, secondaryValue: 0.20 },
        { name: "Jun", value: 4.2, secondaryValue: 0.21 },
      ],
      occupancyData: [
        { name: "Tenants", value: 7420 },
        { name: "Owners", value: 1240 },
        { name: "Vendors", value: 350 },
      ],
      categoryData: [
        { name: "Residential", value: 55, color: "#3b82f6" },
        { name: "Luxury Penthouse", value: 25, color: "#8b5cf6" },
        { name: "Commercial", value: 20, color: "#10b981" },
      ],
      heatmap: [
        { xLabel: "New York", yLabel: "High Density", density: 95, tooltipText: "4,200 Properties" },
        { xLabel: "Los Angeles", yLabel: "High Density", density: 88, tooltipText: "3,100 Properties" },
        { xLabel: "Miami", yLabel: "Medium Density", density: 76, tooltipText: "1,800 Properties" },
        { xLabel: "Chicago", yLabel: "Medium Density", density: 64, tooltipText: "1,200 Properties" },
      ],
    };
  },
};
