export type TicketCategory = "PLUMBING" | "ELECTRICAL" | "HVAC" | "APPLIANCE" | "GENERAL" | "SAFETY";
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketStatus = "OPEN" | "DISPATCHED" | "SCHEDULED" | "IN_PROGRESS" | "INSPECTED" | "COMPLETED" | "CLOSED";

export interface BeforeAfterMedia {
  beforeUrl?: string;
  afterUrl?: string;
  beforeNotes?: string;
  afterNotes?: string;
}

export interface InspectionChecklist {
  inspectorName: string;
  inspectionDate: string;
  safetyPassed: boolean;
  sanitized: boolean;
  notes: string;
}

export interface MaintenanceComment {
  id: string;
  authorName: string;
  authorRole: string;
  avatar?: string;
  text: string;
  timestamp: string;
}

export interface MaintenanceInvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface MaintenanceInvoiceDetails {
  id: string;
  invoiceNumber: string;
  laborHours: number;
  laborRate: number;
  partsTotal: number;
  serviceFee: number;
  total: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PAID";
  items: MaintenanceInvoiceItem[];
}

export interface MaintenanceTimelineStep {
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  completed: boolean;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  propertyTitle: string;
  unitNumber: string;
  tenantName: string;
  category: TicketCategory;
  priority: PriorityLevel;
  status: TicketStatus;
  issueTitle: string;
  description: string;
  permissionToEnter: boolean;
  preferredDate?: string;
  preferredTimeSlot?: string;
  vendorName?: string;
  vendorPhone?: string;
  submittedAt: string;
  estimatedLaborHours?: number;
  media?: BeforeAfterMedia;
  inspection?: InspectionChecklist;
  comments?: MaintenanceComment[];
  invoice?: MaintenanceInvoiceDetails;
  timeline?: MaintenanceTimelineStep[];
  rating?: number;
  feedback?: string;
}
