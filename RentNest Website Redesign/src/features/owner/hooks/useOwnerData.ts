import { useQuery } from "@tanstack/react-query";
import { ownerApi } from "../api/ownerApi";

export const useOwnerRevenueQuery = () => {
  return useQuery({
    queryKey: ["owner-revenue"],
    queryFn: () => ownerApi.getRevenueReport(),
  });
};

export const useOwnerApprovalsQuery = () => {
  return useQuery({
    queryKey: ["owner-approvals"],
    queryFn: () => ownerApi.getLeaseApprovals(),
  });
};

export const useOwnerMaintenanceQuery = () => {
  return useQuery({
    queryKey: ["owner-maintenance"],
    queryFn: () => ownerApi.getMaintenanceJobs(),
  });
};

export const useOwnerDocumentsQuery = () => {
  return useQuery({
    queryKey: ["owner-documents"],
    queryFn: () => ownerApi.getOwnerDocuments(),
  });
};

export const useOwnerCalendarQuery = () => {
  return useQuery({
    queryKey: ["owner-calendar"],
    queryFn: () => ownerApi.getCalendarEvents(),
  });
};
