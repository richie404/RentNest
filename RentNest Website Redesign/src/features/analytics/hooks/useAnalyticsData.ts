import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analyticsApi";
import type { TimeframeOption } from "../types";

export const useTenantAnalyticsQuery = (timeframe: TimeframeOption = "YTD") => {
  return useQuery({
    queryKey: ["tenant-analytics", timeframe],
    queryFn: () => analyticsApi.getTenantAnalytics(timeframe),
  });
};

export const useOwnerAnalyticsQuery = (timeframe: TimeframeOption = "YTD") => {
  return useQuery({
    queryKey: ["owner-analytics", timeframe],
    queryFn: () => analyticsApi.getOwnerAnalytics(timeframe),
  });
};

export const useVendorAnalyticsQuery = (timeframe: TimeframeOption = "YTD") => {
  return useQuery({
    queryKey: ["vendor-analytics", timeframe],
    queryFn: () => analyticsApi.getVendorAnalytics(timeframe),
  });
};

export const useAdminAnalyticsQuery = (timeframe: TimeframeOption = "YTD") => {
  return useQuery({
    queryKey: ["admin-analytics", timeframe],
    queryFn: () => analyticsApi.getAdminAnalytics(timeframe),
  });
};
