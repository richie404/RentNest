import { createBrowserRouter } from "react-router";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { ForbiddenPage } from "@/pages/ForbiddenPage";
import { ErrorPage } from "@/pages/ErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import("@/app/pages/HomePage")).HomePage }),
      },
      {
        path: "login",
        lazy: async () => ({ Component: (await import("@/app/pages/LoginPage")).LoginPage }),
      },
      {
        path: "register",
        lazy: async () => ({ Component: (await import("@/app/pages/RegisterPage")).RegisterPage }),
      },
      {
        path: "forgot-password",
        lazy: async () => ({ Component: (await import("@/app/pages/ForgotPasswordPage")).ForgotPasswordPage }),
      },
      {
        path: "reset-password",
        lazy: async () => ({ Component: (await import("@/app/pages/ResetPasswordPage")).ResetPasswordPage }),
      },
      {
        path: "verify-email",
        lazy: async () => ({ Component: (await import("@/app/pages/VerifyEmailPage")).VerifyEmailPage }),
      },
      {
        path: "browse",
        lazy: async () => ({ Component: (await import("@/app/pages/BrowsePage")).BrowsePage }),
      },
      {
        path: "property/:id",
        lazy: async () => ({ Component: (await import("@/app/pages/PropertyDetailsPage")).PropertyDetailsPage }),
      },
      {
        path: "property/:id/reviews",
        lazy: async () => ({ Component: (await import("@/app/pages/PropertyReviewsPage")).PropertyReviewsPage }),
      },
      {
        path: "compare",
        lazy: async () => ({ Component: (await import("@/app/pages/ComparePropertiesPage")).ComparePropertiesPage }),
      },
      {
        path: "favorites",
        lazy: async () => ({ Component: (await import("@/app/pages/FavoritesPage")).FavoritesPage }),
      },
    ],
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      /* TENANT PORTAL */
      {
        path: "tenant/dashboard",
        lazy: async () => ({ Component: (await import("@/app/pages/RenterDashboardPage")).RenterDashboardPage }),
      },
      {
        path: "tenant/leases",
        lazy: async () => ({ Component: (await import("@/app/pages/TenantLeasesPage")).TenantLeasesPage }),
      },
      {
        path: "tenant/bookings",
        lazy: async () => ({ Component: (await import("@/app/pages/TenantBookingsPage")).TenantBookingsPage }),
      },
      {
        path: "tenant/payments",
        lazy: async () => ({ Component: (await import("@/app/pages/TenantPaymentsPage")).TenantPaymentsPage }),
      },
      {
        path: "tenant/invoices",
        lazy: async () => ({ Component: (await import("@/app/pages/TenantInvoicesPage")).TenantInvoicesPage }),
      },
      {
        path: "tenant/documents",
        lazy: async () => ({ Component: (await import("@/app/pages/TenantDocumentsPage")).TenantDocumentsPage }),
      },
      {
        path: "tenant/maintenance",
        lazy: async () => ({ Component: (await import("@/app/pages/TenantMaintenancePage")).TenantMaintenancePage }),
      },
      {
        path: "tenant/analytics",
        lazy: async () => ({ Component: (await import("@/app/pages/TenantAnalyticsPage")).TenantAnalyticsPage }),
      },
      {
        path: "tenant/messages",
        lazy: async () => ({ Component: (await import("@/app/pages/TenantMessagesPage")).TenantMessagesPage }),
      },
      {
        path: "tenant/notifications",
        lazy: async () => ({ Component: (await import("@/app/pages/TenantNotificationsPage")).TenantNotificationsPage }),
      },
      {
        path: "tenant/saved-searches",
        lazy: async () => ({ Component: (await import("@/app/pages/TenantSavedSearchesPage")).TenantSavedSearchesPage }),
      },

      /* OWNER PORTAL */
      {
        path: "owner/dashboard",
        lazy: async () => ({ Component: (await import("@/app/pages/OwnerDashboardPage")).OwnerDashboardPage }),
      },
      {
        path: "owner/properties",
        lazy: async () => ({ Component: (await import("@/app/pages/OwnerPropertiesPage")).OwnerPropertiesPage }),
      },
      {
        path: "owner/revenue",
        lazy: async () => ({ Component: (await import("@/app/pages/OwnerRevenuePage")).OwnerRevenuePage }),
      },
      {
        path: "owner/bookings",
        lazy: async () => ({ Component: (await import("@/app/pages/OwnerBookingsPage")).OwnerBookingsPage }),
      },
      {
        path: "owner/approvals",
        lazy: async () => ({ Component: (await import("@/app/pages/OwnerLeaseApprovalsPage")).OwnerLeaseApprovalsPage }),
      },
      {
        path: "owner/maintenance",
        lazy: async () => ({ Component: (await import("@/app/pages/OwnerMaintenancePage")).OwnerMaintenancePage }),
      },
      {
        path: "owner/documents",
        lazy: async () => ({ Component: (await import("@/app/pages/OwnerDocumentsPage")).OwnerDocumentsPage }),
      },
      {
        path: "owner/reports",
        lazy: async () => ({ Component: (await import("@/app/pages/OwnerReportsPage")).OwnerReportsPage }),
      },
      {
        path: "owner/calendar",
        lazy: async () => ({ Component: (await import("@/app/pages/OwnerCalendarPage")).OwnerCalendarPage }),
      },
      {
        path: "owner/analytics/:id",
        lazy: async () => ({ Component: (await import("@/app/pages/PropertyAnalyticsPage")).PropertyAnalyticsPage }),
      },

      /* VENDOR PORTAL (11 MODULES) */
      {
        path: "vendor/dashboard",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorDashboardPage")).VendorDashboardPage }),
      },
      {
        path: "vendor/jobs",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorWorkOrdersPage")).VendorWorkOrdersPage }),
      },
      {
        path: "vendor/work-orders",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorWorkOrdersPage")).VendorWorkOrdersPage }),
      },
      {
        path: "vendor/calendar",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorCalendarPage")).VendorCalendarPage }),
      },
      {
        path: "vendor/completed",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorCompletedJobsPage")).VendorCompletedJobsPage }),
      },
      {
        path: "vendor/invoices",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorInvoicesPage")).VendorInvoicesPage }),
      },
      {
        path: "vendor/payments",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorPaymentsPage")).VendorPaymentsPage }),
      },
      {
        path: "vendor/ratings",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorRatingsPage")).VendorRatingsPage }),
      },
      {
        path: "vendor/messages",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorMessagesPage")).VendorMessagesPage }),
      },
      {
        path: "vendor/inventory",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorInventoryPage")).VendorInventoryPage }),
      },
      {
        path: "vendor/reports",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorReportsPage")).VendorReportsPage }),
      },
      {
        path: "vendor/settings",
        lazy: async () => ({ Component: (await import("@/app/pages/VendorSettingsPage")).VendorSettingsPage }),
      },

      /* ADMIN PORTAL (17 MODULES) */
      {
        path: "admin/dashboard",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminDashboardPage")).AdminDashboardPage }),
      },
      {
        path: "admin/users",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminUsersPage")).AdminUsersPage }),
      },
      {
        path: "admin/roles",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminRolesPage")).AdminRolesPage }),
      },
      {
        path: "admin/permissions",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminPermissionsPage")).AdminPermissionsPage }),
      },
      {
        path: "admin/properties",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminPropertiesPage")).AdminPropertiesPage }),
      },
      {
        path: "admin/listings",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminPropertiesPage")).AdminPropertiesPage }),
      },
      {
        path: "admin/bookings",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminBookingsPage")).AdminBookingsPage }),
      },
      {
        path: "admin/payments",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminPaymentsPage")).AdminPaymentsPage }),
      },
      {
        path: "admin/maintenance",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminMaintenancePage")).AdminMaintenancePage }),
      },
      {
        path: "admin/reports",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminReportsPage")).AdminReportsPage }),
      },
      {
        path: "admin/analytics",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminAnalyticsPage")).AdminAnalyticsPage }),
      },
      {
        path: "admin/audit-logs",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminAuditLogsPage")).AdminAuditLogsPage }),
      },
      {
        path: "admin/notifications",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminNotificationsPage")).AdminNotificationsPage }),
      },
      {
        path: "admin/support",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminSupportTicketsPage")).AdminSupportTicketsPage }),
      },
      {
        path: "admin/ai-monitoring",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminAIMonitoringPage")).AdminAIMonitoringPage }),
      },
      {
        path: "admin/settings",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminSettingsPage")).AdminSettingsPage }),
      },
      {
        path: "admin/system-health",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminSystemHealthPage")).AdminSystemHealthPage }),
      },
      {
        path: "admin/feature-flags",
        lazy: async () => ({ Component: (await import("@/app/pages/AdminFeatureFlagsPage")).AdminFeatureFlagsPage }),
      },

      /* SHARED ROUTES */
      {
        path: "messages",
        lazy: async () => ({ Component: (await import("@/app/pages/MessagesPage")).MessagesPage }),
      },
      {
        path: "profile",
        lazy: async () => ({ Component: (await import("@/app/pages/UserProfilePage")).UserProfilePage }),
      },
      {
        path: "settings",
        lazy: async () => ({ Component: (await import("@/app/pages/UserSettingsPage")).UserSettingsPage }),
      },
    ],
  },
  {
    path: "/403",
    element: <ForbiddenPage />,
  },
  {
    path: "/500",
    element: <ErrorPage />,
  },
  {
    path: "*",
    lazy: async () => ({ Component: (await import("@/app/pages/NotFoundPage")).NotFoundPage }),
  },
]);
