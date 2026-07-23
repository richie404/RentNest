import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApi } from "../api/vendorApi";
import type { VendorJob, InventoryItem, VendorInvoice, VendorSettings } from "../types/vendor";

export const useVendorJobsQuery = () => {
  return useQuery({
    queryKey: ["vendor-assigned-jobs"],
    queryFn: () => vendorApi.getAssignedJobs(),
  });
};

export const useVendorCompletedJobsQuery = () => {
  return useQuery({
    queryKey: ["vendor-completed-jobs"],
    queryFn: () => vendorApi.getCompletedJobs(),
  });
};

export const useVendorInvoicesQuery = () => {
  return useQuery({
    queryKey: ["vendor-invoices"],
    queryFn: () => vendorApi.getVendorInvoices(),
  });
};

export const useVendorPaymentsQuery = () => {
  return useQuery({
    queryKey: ["vendor-payments"],
    queryFn: () => vendorApi.getVendorPayments(),
  });
};

export const useVendorInventoryQuery = () => {
  return useQuery({
    queryKey: ["vendor-inventory"],
    queryFn: () => vendorApi.getInventory(),
  });
};

export const useVendorRatingsQuery = () => {
  return useQuery({
    queryKey: ["vendor-ratings"],
    queryFn: () => vendorApi.getRatings(),
  });
};

export const useVendorSettingsQuery = () => {
  return useQuery({
    queryKey: ["vendor-settings"],
    queryFn: () => vendorApi.getVendorSettings(),
  });
};

export const useUpdateJobStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: VendorJob["status"] }) =>
      vendorApi.updateJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-assigned-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-completed-jobs"] });
    },
  });
};

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoice: Omit<VendorInvoice, "id" | "submittedDate">) =>
      vendorApi.createInvoice(invoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-invoices"] });
    },
  });
};

export const useAddInventoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: Omit<InventoryItem, "id">) => vendorApi.addInventoryItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-inventory"] });
    },
  });
};

export const useUpdateStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      vendorApi.updateInventoryStock(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-inventory"] });
    },
  });
};

export const useReplyReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, replyText }: { reviewId: string; replyText: string }) =>
      vendorApi.replyToReview(reviewId, replyText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-ratings"] });
    },
  });
};

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSettings: Partial<VendorSettings>) => vendorApi.updateVendorSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-settings"] });
    },
  });
};
