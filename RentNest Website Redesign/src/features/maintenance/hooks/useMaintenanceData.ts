import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceApi } from "../api/maintenanceApi";
import type { MaintenanceTicket } from "../types/maintenance";

export const useMaintenanceTicketsQuery = () => {
  return useQuery({
    queryKey: ["maintenance-tickets"],
    queryFn: () => maintenanceApi.getTickets(),
  });
};

export const useCreateTicketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MaintenanceTicket>) => maintenanceApi.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tickets"] });
    },
  });
};

export const useAssignVendorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, vendorName, vendorPhone }: { ticketId: string; vendorName: string; vendorPhone: string }) =>
      maintenanceApi.assignVendor(ticketId, vendorName, vendorPhone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tickets"] });
    },
  });
};

export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, text, authorName, authorRole }: { ticketId: string; text: string; authorName: string; authorRole: string }) =>
      maintenanceApi.addComment(ticketId, text, authorName, authorRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tickets"] });
    },
  });
};

export const useApproveInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => maintenanceApi.approveInvoice(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tickets"] });
    },
  });
};

export const useCompleteTicketMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, rating, feedback }: { ticketId: string; rating: number; feedback: string }) =>
      maintenanceApi.completeTicket(ticketId, rating, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tickets"] });
    },
  });
};
