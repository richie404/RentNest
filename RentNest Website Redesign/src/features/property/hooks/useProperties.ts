import { useQuery, useMutation } from "@tanstack/react-query";
import { propertyApi } from "../api/propertyApi";
import { showToast } from "@/components/ui/Toast";
import type { VisitSchedulePayload } from "../types/property";

export const usePropertyListQuery = (filters?: { query?: string; type?: string }) => {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => propertyApi.getProperties(filters),
  });
};

export const usePropertyDetailsQuery = (id: number) => {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyApi.getPropertyById(id),
    enabled: !!id,
  });
};

export const useScheduleVisitMutation = () => {
  return useMutation({
    mutationFn: (payload: VisitSchedulePayload) => propertyApi.scheduleVisit(payload),
    onSuccess: (res) => {
      showToast.success("Tour Scheduled!", res.message);
    },
    onError: (err: Error) => {
      showToast.error("Scheduling Failed", err.message);
    },
  });
};

export const usePropertyAnalyticsQuery = (id: number) => {
  return useQuery({
    queryKey: ["property-analytics", id],
    queryFn: () => propertyApi.getPropertyAnalytics(id),
    enabled: !!id,
  });
};
