import type {
  AdminUser,
  AdminRole,
  AdminPermission,
  AdminProperty,
  AdminBooking,
  AdminPayment,
  AdminMaintenanceTicket,
  AdminAuditLog,
  AdminNotificationBroadcast,
  AdminSupportTicket,
  AdminAIMetric,
  AdminSystemTelemetry,
  AdminFeatureFlag,
} from "../types/admin";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let usersStore: AdminUser[] = [
  { id: "USR-101", name: "Jane Doe", email: "tenant@rentnest.com", role: "ROLE_TENANT", status: "ACTIVE", joinedDate: "2026-01-15", verified: true },
  { id: "USR-102", name: "Alexander Vance", email: "owner@rentnest.com", role: "ROLE_PROPERTY_OWNER", status: "ACTIVE", joinedDate: "2025-11-20", verified: true },
  { id: "USR-103", name: "Apex Plumbing Co.", email: "vendor@rentnest.com", role: "ROLE_VENDOR", status: "ACTIVE", joinedDate: "2026-02-01", verified: true },
  { id: "USR-104", name: "System Admin", email: "admin@rentnest.com", role: "ROLE_ADMIN", status: "ACTIVE", joinedDate: "2025-08-10", verified: true },
  { id: "USR-105", name: "Sarah Support", email: "support@rentnest.com", role: "ROLE_SUPPORT", status: "ACTIVE", joinedDate: "2026-03-12", verified: true },
];

let propertiesStore: AdminProperty[] = [
  { id: "PROP-1", title: "Grand Horizon Luxury Penthouse", ownerName: "Alexander Vance", city: "New York", pricePerMonth: 4500, moderationStatus: "APPROVED", safetyScore: 98, submittedAt: "2026-07-01" },
  { id: "PROP-2", title: "The Botanical Glass Loft", ownerName: "Sophia Martinez", city: "Los Angeles", pricePerMonth: 3200, moderationStatus: "PENDING", safetyScore: 85, submittedAt: "2026-07-20" },
  { id: "PROP-3", title: "Sunset Harbor Villa", ownerName: "David Kim", city: "Miami", pricePerMonth: 5800, moderationStatus: "APPROVED", safetyScore: 95, submittedAt: "2026-06-14" },
];

let flagsStore: AdminFeatureFlag[] = [
  { id: "FF-1", flagKey: "ai_smart_pricing_v2", title: "AI Yield Pricing V2 Engine", description: "Dynamic rate adjustments based on seasonal occupancy forecasting", enabled: true, rolloutPercentage: 50, targetRoles: ["ROLE_PROPERTY_OWNER"] },
  { id: "FF-2", flagKey: "instant_crypto_payouts", title: "Instant USDC Payouts", description: "Direct blockchain settlement for vendor and owner payouts", enabled: false, rolloutPercentage: 0, targetRoles: ["ROLE_VENDOR", "ROLE_PROPERTY_OWNER"] },
  { id: "FF-3", flagKey: "tenant_credit_boost", title: "Tenant Rent Credit Reporting", description: "Automated monthly rent reporting to Experian & Equifax", enabled: true, rolloutPercentage: 100, targetRoles: ["ROLE_TENANT"] },
];

export const adminApi = {
  getUsers: async (): Promise<AdminUser[]> => {
    await delay(300);
    return [...usersStore];
  },
  updateUserStatus: async (userId: string, status: AdminUser["status"]): Promise<AdminUser> => {
    await delay(200);
    const user = usersStore.find((u) => u.id === userId);
    if (user) {
      user.status = status;
      return user;
    }
    throw new Error("User not found");
  },
  getRoles: async (): Promise<AdminRole[]> => {
    await delay(200);
    return [
      { id: "R-1", roleCode: "ROLE_ADMIN", roleName: "Super Administrator", description: "Full root access to all system governance modules", usersCount: 3, permissions: ["*"] },
      { id: "R-2", roleCode: "ROLE_PROPERTY_OWNER", roleName: "Property Owner", description: "Manage listings, approve leases, view payout financial analytics", usersCount: 1240, permissions: ["property:write", "lease:approve"] },
      { id: "R-3", roleCode: "ROLE_TENANT", roleName: "Tenant", description: "Browse listings, submit lease bookings, request maintenance", usersCount: 7420, permissions: ["booking:create", "ticket:create"] },
      { id: "R-4", roleCode: "ROLE_VENDOR", roleName: "Maintenance Vendor", description: "Accept work dispatch tickets, issue labor invoices", usersCount: 350, permissions: ["ticket:update", "invoice:create"] },
    ];
  },
  getPermissions: async (): Promise<AdminPermission[]> => {
    await delay(200);
    return [
      { id: "P-1", code: "user:manage", name: "User Management", module: "USERS", description: "Ability to suspend or verify user credentials" },
      { id: "P-2", code: "property:approve", name: "Property Moderation", module: "PROPERTIES", description: "Approve or reject public property listings" },
      { id: "P-3", code: "payment:refund", name: "Process Financial Refunds", module: "PAYMENTS", description: "Issue refunds for disputed booking deposits" },
      { id: "P-4", code: "ai:override", name: "AI Model Override", module: "AI", description: "Manually recalibrate pricing engine thresholds" },
    ];
  },
  getProperties: async (): Promise<AdminProperty[]> => {
    await delay(300);
    return [...propertiesStore];
  },
  moderateProperty: async (id: string, status: AdminProperty["moderationStatus"]): Promise<AdminProperty> => {
    await delay(200);
    const p = propertiesStore.find((item) => item.id === id);
    if (p) {
      p.moderationStatus = status;
      return p;
    }
    throw new Error("Property not found");
  },
  getBookings: async (): Promise<AdminBooking[]> => {
    await delay(300);
    return [
      { id: "BK-901", bookingRef: "RN-2026-901", propertyTitle: "Grand Horizon Luxury Penthouse", tenantName: "Jane Doe", ownerName: "Alexander Vance", startDate: "2026-08-01", endDate: "2027-07-31", totalAmount: 54000, status: "CONFIRMED" },
      { id: "BK-902", bookingRef: "RN-2026-902", propertyTitle: "The Botanical Glass Loft", tenantName: "Marcus Sterling", ownerName: "Sophia Martinez", startDate: "2026-08-15", endDate: "2027-08-14", totalAmount: 38400, status: "PENDING" },
    ];
  },
  getPayments: async (): Promise<AdminPayment[]> => {
    await delay(300);
    return [
      { id: "TX-401", transactionRef: "TXN-8849201", payerName: "Jane Doe", recipientName: "Alexander Vance", amount: 4500, platformFee: 225, gateway: "Stripe", timestamp: "2026-07-23 14:20", status: "SUCCESSFUL" },
      { id: "TX-402", transactionRef: "TXN-8849202", payerName: "Marcus Sterling", recipientName: "Sophia Martinez", amount: 3200, platformFee: 160, gateway: "ACH Direct", timestamp: "2026-07-22 09:15", status: "SUCCESSFUL" },
    ];
  },
  getMaintenanceTickets: async (): Promise<AdminMaintenanceTicket[]> => {
    await delay(300);
    return [
      { id: "T-804", ticketNumber: "TKT-804", propertyTitle: "Grand Horizon Luxury Penthouse", tenantName: "Jane Doe", vendorName: "Apex Plumbing Services", priority: "HIGH", status: "IN_PROGRESS", createdAt: "2026-07-22", slaLimitHours: 24 },
      { id: "T-805", ticketNumber: "TKT-805", propertyTitle: "The Botanical Glass Loft", tenantName: "Marcus Sterling", vendorName: "Apex Plumbing Services", priority: "URGENT", status: "SLA_VIOLATION", createdAt: "2026-07-20", slaLimitHours: 12 },
    ];
  },
  getAuditLogs: async (): Promise<AdminAuditLog[]> => {
    await delay(200);
    return [
      { id: "LOG-1", actorEmail: "admin@rentnest.com", action: "Approved Listing PROP-1", ipAddress: "192.168.1.1", category: "USER_MGMT", timestamp: "2026-07-23 21:04", details: "Verified title deed and safety checklist" },
      { id: "LOG-2", actorEmail: "owner@rentnest.com", action: "Updated Rental Price", ipAddress: "24.108.4.12", category: "FINANCIAL", timestamp: "2026-07-23 19:40", details: "Adjusted monthly rent from $4,200 to $4,500" },
    ];
  },
  getNotifications: async (): Promise<AdminNotificationBroadcast[]> => {
    await delay(200);
    return [
      { id: "N-1", title: "Scheduled Maintenance Outage Warning", targetRole: "ALL", channel: "IN_APP", sentAt: "2026-07-20", deliveredCount: 8940 },
      { id: "N-2", title: "New Tax Withholding Requirement Form 1099", targetRole: "OWNERS", channel: "EMAIL", sentAt: "2026-07-10", deliveredCount: 1240 },
    ];
  },
  getSupportTickets: async (): Promise<AdminSupportTicket[]> => {
    await delay(200);
    return [
      { id: "ST-1", ticketId: "SUP-401", userName: "Marcus Sterling", userRole: "TENANT", subject: "Lease e-signature failure on iOS safari", priority: "HIGH", status: "OPEN", createdAt: "2026-07-23" },
      { id: "ST-2", ticketId: "SUP-402", userName: "Sophia Martinez", userRole: "PROPERTY_OWNER", subject: "Bank routing verification delay", priority: "NORMAL", status: "IN_PROGRESS", createdAt: "2026-07-22" },
    ];
  },
  getAIMetrics: async (): Promise<AdminAIMetric[]> => {
    await delay(200);
    return [
      { id: "AI-1", modelName: "RentNest Smart Yield Predictor v2.4", taskType: "Rent Pricing", avgLatencyMs: 140, dailyTokens: 450000, accuracyRate: 96.8, costToday: 14.20 },
      { id: "AI-2", modelName: "Tenant Screening Fraud Detector", taskType: "Document Verification", avgLatencyMs: 320, dailyTokens: 890000, accuracyRate: 99.1, costToday: 28.50 },
    ];
  },
  getSystemTelemetry: async (): Promise<AdminSystemTelemetry> => {
    await delay(150);
    return {
      cpuUsagePct: 24.5,
      memoryUsagePct: 58.2,
      dbConnections: 142,
      apiRequestsPerMin: 3450,
      activeNodes: 8,
      uptimePct: 99.98,
    };
  },
  getFeatureFlags: async (): Promise<AdminFeatureFlag[]> => {
    await delay(200);
    return [...flagsStore];
  },
  toggleFeatureFlag: async (flagId: string, enabled: boolean): Promise<AdminFeatureFlag> => {
    await delay(200);
    const flag = flagsStore.find((f) => f.id === flagId);
    if (flag) {
      flag.enabled = enabled;
      return flag;
    }
    throw new Error("Flag not found");
  },
};
