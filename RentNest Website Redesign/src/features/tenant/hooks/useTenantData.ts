import { useQuery } from "@tanstack/react-query";
import { tenantApi } from "../api/tenantApi";

export const useTenantLeasesQuery = () => {
  return useQuery({
    queryKey: ["tenant-leases"],
    queryFn: () => tenantApi.getLeases(),
  });
};

export const useTenantBookingsQuery = () => {
  return useQuery({
    queryKey: ["tenant-bookings"],
    queryFn: () => tenantApi.getBookings(),
  });
};

export const useTenantPaymentsQuery = () => {
  return useQuery({
    queryKey: ["tenant-payments"],
    queryFn: () => tenantApi.getPayments(),
  });
};

export const useTenantInvoicesQuery = () => {
  return useQuery({
    queryKey: ["tenant-invoices"],
    queryFn: () => tenantApi.getInvoices(),
  });
};

export const useTenantDocumentsQuery = () => {
  return useQuery({
    queryKey: ["tenant-documents"],
    queryFn: () => tenantApi.getDocuments(),
  });
};

export const useTenantMaintenanceQuery = () => {
  return useQuery({
    queryKey: ["tenant-maintenance"],
    queryFn: () => tenantApi.getMaintenanceTickets(),
  });
};

export const useTenantSavedSearchesQuery = () => {
  return useQuery({
    queryKey: ["tenant-saved-searches"],
    queryFn: () => tenantApi.getSavedSearches(),
  });
};
