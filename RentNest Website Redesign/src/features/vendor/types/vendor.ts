export interface VendorJob {
  id: string;
  ticketNumber: string;
  propertyTitle: string;
  unitNumber: string;
  address?: string;
  tenantName?: string;
  tenantPhone?: string;
  issueTitle: string;
  description?: string;
  category: "PLUMBING" | "ELECTRICAL" | "HVAC" | "APPLIANCE" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "ASSIGNED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED";
  scheduledDate: string;
  scheduledTimeSlot?: string;
  estimatedLaborHours: number;
  laborRate?: number;
  partsCost?: number;
  totalCost?: number;
  notes?: string[];
  beforeImage?: string;
  afterImage?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  workOrderId: string;
  propertyTitle?: string;
  amountBilled: number;
  taxAmount?: number;
  totalAmount?: number;
  submittedDate: string;
  dueDate?: string;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  lineItems?: InvoiceLineItem[];
}

export interface VendorPayment {
  id: string;
  paymentNumber: string;
  amountPaid: number;
  paymentDate: string;
  method: string;
  referenceId?: string;
  grossAmount?: number;
  platformFee?: number;
  netPayout?: number;
  status?: "COMPLETED" | "PROCESSING" | "SCHEDULED";
}

export interface InventoryItem {
  id: string;
  sku?: string;
  itemName: string;
  category: string;
  quantityInStock: number;
  reorderLevel?: number;
  unitCost: number;
  location?: string;
}

export interface VendorReview {
  id: string;
  reviewerName: string;
  reviewerRole?: "OWNER" | "TENANT";
  rating: number;
  date: string;
  comment: string;
  reply?: string;
  replyDate?: string;
}

export interface VendorRatingData {
  averageRating: number;
  totalReviews: number;
  punctualityRating?: number;
  workmanshipRating?: number;
  communicationRating?: number;
  valueRating?: number;
  ratingDistribution?: { stars: number; count: number }[];
  recentReviews: VendorReview[];
}

export interface VendorSettings {
  companyName: string;
  taxId: string;
  licenseNumber: string;
  contactEmail: string;
  contactPhone: string;
  emergencyPhone: string;
  serviceCategories: string[];
  coveredZipCodes: string[];
  hourlyLaborRate: number;
  emergencyCalloutFee: number;
  bankName: string;
  accountNumberMasked: string;
  routingNumberMasked: string;
  emailNotifications: boolean;
  smsAlerts: boolean;
}
