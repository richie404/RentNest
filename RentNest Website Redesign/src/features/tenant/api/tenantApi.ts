import type {
  LeaseContract,
  TenantBooking,
  TenantPayment,
  TenantInvoice,
  TenantDocument,
  MaintenanceTicketData,
  SavedSearchItem,
} from "../types/tenant";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const tenantApi = {
  getLeases: async (): Promise<LeaseContract[]> => {
    await delay(300);
    return [
      {
        id: "LSE-9901",
        propertyTitle: "Grand Horizon Luxury Penthouse",
        unitNumber: "Suite 4501",
        startDate: "2025-08-01",
        endDate: "2026-07-31",
        monthlyRent: 4850,
        securityDeposit: 4850,
        status: "ACTIVE",
        pdfDocumentUrl: "#",
      },
    ];
  },

  getBookings: async (): Promise<TenantBooking[]> => {
    await delay(300);
    return [
      {
        id: "BKG-2041",
        propertyTitle: "Grand Horizon Luxury Penthouse",
        checkInDate: "2025-08-01",
        checkOutDate: "2026-07-31",
        totalPaid: 58200,
        status: "CONFIRMED",
      },
    ];
  },

  getPayments: async (): Promise<TenantPayment[]> => {
    await delay(300);
    return [
      {
        id: "PAY-8801",
        paymentNumber: "PAY-2026-07",
        propertyTitle: "Grand Horizon Penthouse",
        amount: 4850,
        paymentDate: "2026-07-01",
        paymentMethod: "Bank Transfer (ACH)",
        status: "COMPLETED",
      },
      {
        id: "PAY-8802",
        paymentNumber: "PAY-2026-06",
        propertyTitle: "Grand Horizon Penthouse",
        amount: 4850,
        paymentDate: "2026-06-01",
        paymentMethod: "Bank Transfer (ACH)",
        status: "COMPLETED",
      },
    ];
  },

  getInvoices: async (): Promise<TenantInvoice[]> => {
    await delay(300);
    return [
      {
        id: "INV-104",
        invoiceNumber: "INV-2026-08",
        propertyTitle: "Grand Horizon Penthouse",
        amount: 4850,
        dueDate: "2026-08-01",
        status: "PENDING",
      },
      {
        id: "INV-103",
        invoiceNumber: "INV-2026-07",
        propertyTitle: "Grand Horizon Penthouse",
        amount: 4850,
        dueDate: "2026-07-01",
        status: "COMPLETED",
      },
    ];
  },

  getDocuments: async (): Promise<TenantDocument[]> => {
    await delay(300);
    return [
      {
        id: "DOC-1",
        title: "Signed Residential Lease Agreement",
        category: "LEASE",
        fileSize: "2.4 MB",
        uploadedAt: "2025-07-28",
      },
      {
        id: "DOC-2",
        title: "Move-In Condition Inspection Report",
        category: "INSPECTION",
        fileSize: "5.1 MB",
        uploadedAt: "2025-08-01",
      },
    ];
  },

  getMaintenanceTickets: async (): Promise<MaintenanceTicketData[]> => {
    await delay(300);
    return [
      {
        id: "TKT-804",
        title: "Kitchen Sink Disposal Clogged",
        category: "PLUMBING",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        submittedAt: "2026-07-20",
        description: "Garbage disposal unit unit motor hums but blade fails to spin.",
      },
      {
        id: "TKT-702",
        title: "HVAC Filter Replacement",
        category: "HVAC",
        priority: "LOW",
        status: "RESOLVED",
        submittedAt: "2026-05-10",
        description: "Routine air intake filter replacement completed by Apex Plumbing.",
      },
    ];
  },

  getSavedSearches: async (): Promise<SavedSearchItem[]> => {
    await delay(200);
    return [
      {
        id: "SRCH-1",
        searchTitle: "Downtown Luxury Penthouses",
        filtersSummary: "3+ Beds, Pet Friendly, Pool",
        savedAt: "2026-06-12",
      },
    ];
  },
};
