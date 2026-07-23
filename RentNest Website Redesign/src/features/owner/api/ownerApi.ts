import type {
  RevenueReportData,
  LeaseApprovalRequest,
  OwnerMaintenanceJob,
  OwnerDocument,
  CalendarEvent,
} from "../types/owner";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ownerApi = {
  getRevenueReport: async (): Promise<RevenueReportData> => {
    await delay(400);
    return {
      totalRevenue: 142500,
      netPayout: 135375,
      platformFees: 7125,
      occupancyRate: 96.8,
      monthlyBreakdown: [
        { month: "Jan", value: 23500 },
        { month: "Feb", value: 23500 },
        { month: "Mar", value: 23500 },
        { month: "Apr", value: 24000 },
        { month: "May", value: 24000 },
        { month: "Jun", value: 24000 },
      ],
    };
  },

  getLeaseApprovals: async (): Promise<LeaseApprovalRequest[]> => {
    await delay(300);
    return [
      {
        id: "APP-401",
        applicantName: "Jonathan Vance",
        applicantCreditScore: 785,
        propertyTitle: "The Botanical Glass Loft",
        proposedRent: 3200,
        moveInDate: "2026-08-15",
        status: "PENDING",
      },
      {
        id: "APP-402",
        applicantName: "Sophia Martinez",
        applicantCreditScore: 740,
        propertyTitle: "Urban Industrial Brick Studio",
        proposedRent: 2100,
        moveInDate: "2026-08-01",
        status: "PENDING",
      },
    ];
  },

  getMaintenanceJobs: async (): Promise<OwnerMaintenanceJob[]> => {
    await delay(300);
    return [
      {
        id: "JOB-901",
        propertyTitle: "Grand Horizon Penthouse",
        issueDescription: "Garbage disposal unit motor replacement",
        estimatedCost: 350,
        vendorName: "Apex Plumbing Services",
        status: "APPROVED",
      },
    ];
  },

  getOwnerDocuments: async (): Promise<OwnerDocument[]> => {
    await delay(300);
    return [
      {
        id: "ODOC-1",
        title: "Property Title Deed - Grand Horizon",
        category: "DEED",
        uploadedAt: "2025-01-10",
        fileSize: "8.4 MB",
      },
      {
        id: "ODOC-2",
        title: "Property Insurance Certificate 2026",
        category: "INSURANCE",
        uploadedAt: "2026-01-02",
        fileSize: "1.2 MB",
      },
    ];
  },

  getCalendarEvents: async (): Promise<CalendarEvent[]> => {
    await delay(200);
    return [
      { id: "EVT-1", title: "Rent Due - Suite 4501", date: "2026-08-01", type: "RENT_DUE" },
      { id: "EVT-2", title: "Tenant Move-In: Botanical Loft", date: "2026-08-15", type: "LEASE_EXPIRATION" },
      { id: "EVT-3", title: "Annual Fire Safety Inspection", date: "2026-08-20", type: "INSPECTION" },
    ];
  },
};
