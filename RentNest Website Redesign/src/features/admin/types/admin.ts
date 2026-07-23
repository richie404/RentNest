export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ROLE_TENANT" | "ROLE_PROPERTY_OWNER" | "ROLE_VENDOR" | "ROLE_ADMIN" | "ROLE_SUPPORT";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  joinedDate: string;
  verified: boolean;
  avatar?: string;
  phone?: string;
}

export interface AdminRole {
  id: string;
  roleCode: string;
  roleName: string;
  description: string;
  usersCount: number;
  permissions: string[];
}

export interface AdminPermission {
  id: string;
  code: string;
  name: string;
  module: "USERS" | "PROPERTIES" | "PAYMENTS" | "SYSTEM" | "AI";
  description: string;
}

export interface AdminProperty {
  id: string;
  title: string;
  ownerName: string;
  city: string;
  pricePerMonth: number;
  moderationStatus: "APPROVED" | "PENDING" | "REJECTED";
  safetyScore: number;
  submittedAt: string;
}

export interface AdminBooking {
  id: string;
  bookingRef: string;
  propertyTitle: string;
  tenantName: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED";
}

export interface AdminPayment {
  id: string;
  transactionRef: string;
  payerName: string;
  recipientName: string;
  amount: number;
  platformFee: number;
  gateway: "Stripe" | "ACH Direct" | "PayPal";
  timestamp: string;
  status: "SUCCESSFUL" | "PENDING" | "FAILED" | "REFUNDED";
}

export interface AdminMaintenanceTicket {
  id: string;
  ticketNumber: string;
  propertyTitle: string;
  tenantName: string;
  vendorName: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "SLA_VIOLATION" | "CLOSED";
  createdAt: string;
  slaLimitHours: number;
}

export interface AdminAuditLog {
  id: string;
  actorEmail: string;
  action: string;
  ipAddress: string;
  category: "AUTH" | "USER_MGMT" | "FINANCIAL" | "SYSTEM";
  timestamp: string;
  details: string;
}

export interface AdminNotificationBroadcast {
  id: string;
  title: string;
  targetRole: "ALL" | "TENANTS" | "OWNERS" | "VENDORS";
  channel: "IN_APP" | "EMAIL" | "PUSH_SMS";
  sentAt: string;
  deliveredCount: number;
}

export interface AdminSupportTicket {
  id: string;
  ticketId: string;
  userName: string;
  userRole: string;
  subject: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

export interface AdminAIMetric {
  id: string;
  modelName: string;
  taskType: string;
  avgLatencyMs: number;
  dailyTokens: number;
  accuracyRate: number;
  costToday: number;
}

export interface AdminSystemTelemetry {
  cpuUsagePct: number;
  memoryUsagePct: number;
  dbConnections: number;
  apiRequestsPerMin: number;
  activeNodes: number;
  uptimePct: number;
}

export interface AdminFeatureFlag {
  id: string;
  flagKey: string;
  title: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetRoles: string[];
}
