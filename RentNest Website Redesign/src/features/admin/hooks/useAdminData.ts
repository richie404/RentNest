import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import type { AdminUser, AdminProperty } from "../types/admin";

export const useAdminUsersQuery = () => {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getUsers(),
  });
};

export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: AdminUser["status"] }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useAdminRolesQuery = () => {
  return useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => adminApi.getRoles(),
  });
};

export const useAdminPermissionsQuery = () => {
  return useQuery({
    queryKey: ["admin-permissions"],
    queryFn: () => adminApi.getPermissions(),
  });
};

export const useAdminPropertiesQuery = () => {
  return useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => adminApi.getProperties(),
  });
};

export const useModeratePropertyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminProperty["moderationStatus"] }) =>
      adminApi.moderateProperty(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
  });
};

export const useAdminBookingsQuery = () => {
  return useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => adminApi.getBookings(),
  });
};

export const useAdminPaymentsQuery = () => {
  return useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => adminApi.getPayments(),
  });
};

export const useAdminMaintenanceQuery = () => {
  return useQuery({
    queryKey: ["admin-maintenance"],
    queryFn: () => adminApi.getMaintenanceTickets(),
  });
};

export const useAdminAuditLogsQuery = () => {
  return useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => adminApi.getAuditLogs(),
  });
};

export const useAdminNotificationsQuery = () => {
  return useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => adminApi.getNotifications(),
  });
};

export const useAdminSupportTicketsQuery = () => {
  return useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: () => adminApi.getSupportTickets(),
  });
};

export const useAdminAIMetricsQuery = () => {
  return useQuery({
    queryKey: ["admin-ai-metrics"],
    queryFn: () => adminApi.getAIMetrics(),
  });
};

export const useAdminSystemTelemetryQuery = () => {
  return useQuery({
    queryKey: ["admin-telemetry"],
    queryFn: () => adminApi.getSystemTelemetry(),
    refetchInterval: 5000,
  });
};

export const useAdminFeatureFlagsQuery = () => {
  return useQuery({
    queryKey: ["admin-feature-flags"],
    queryFn: () => adminApi.getFeatureFlags(),
  });
};

export const useToggleFeatureFlagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ flagId, enabled }: { flagId: string; enabled: boolean }) =>
      adminApi.toggleFeatureFlag(flagId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] });
    },
  });
};
