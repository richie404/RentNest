export interface RevenueReportData {
  totalRevenue: number;
  netPayout: number;
  platformFees: number;
  occupancyRate: number;
  monthlyBreakdown: { month: string; value: number }[];
}

export interface LeaseApprovalRequest {
  id: string;
  applicantName: string;
  applicantCreditScore: number;
  propertyTitle: string;
  proposedRent: number;
  moveInDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface OwnerMaintenanceJob {
  id: string;
  propertyTitle: string;
  issueDescription: string;
  estimatedCost: number;
  vendorName: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "IN_PROGRESS" | "COMPLETED";
}

export interface OwnerDocument {
  id: string;
  title: string;
  category: "DEED" | "TAX_STATEMENT" | "INSURANCE" | "LEASE";
  uploadedAt: string;
  fileSize: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "LEASE_EXPIRATION" | "INSPECTION" | "RENT_DUE" | "MAINTENANCE";
}
