export interface LeaseContract {
  id: string;
  propertyTitle: string;
  unitNumber: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: "ACTIVE" | "EXPIRED" | "PENDING_RENEWAL";
  pdfDocumentUrl: string;
}

export interface TenantBooking {
  id: string;
  propertyTitle: string;
  checkInDate: string;
  checkOutDate: string;
  totalPaid: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
}

export interface TenantPayment {
  id: string;
  paymentNumber: string;
  propertyTitle: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
}

export interface TenantInvoice {
  id: string;
  invoiceNumber: string;
  propertyTitle: string;
  amount: number;
  dueDate: string;
  status: "COMPLETED" | "PENDING" | "OVERDUE";
}

export interface TenantDocument {
  id: string;
  title: string;
  category: "LEASE" | "RECEIPT" | "INSPECTION" | "IDENTITY";
  fileSize: string;
  uploadedAt: string;
}

export interface MaintenanceTicketData {
  id: string;
  title: string;
  category: "PLUMBING" | "ELECTRICAL" | "HVAC" | "APPLIANCE" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "SUBMITTED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";
  submittedAt: string;
  description: string;
}

export interface SavedSearchItem {
  id: string;
  searchTitle: string;
  filtersSummary: string;
  savedAt: string;
}
