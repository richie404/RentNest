import type {
  VendorJob,
  VendorInvoice,
  VendorPayment,
  InventoryItem,
  VendorRatingData,
  VendorSettings,
} from "../types/vendor";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let jobsStore: VendorJob[] = [
  {
    id: "JOB-804",
    ticketNumber: "TKT-804",
    propertyTitle: "Grand Horizon Luxury Penthouse",
    unitNumber: "Suite 4501",
    address: "742 Evergreen Terrace, Downtown",
    tenantName: "Jane Doe",
    tenantPhone: "+1 (555) 234-5678",
    issueTitle: "Kitchen Disposal Motor Replacement",
    description: "The garbage disposal unit makes a humming noise and fails to spin. Requires motor replacement or unjamming.",
    category: "PLUMBING",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    scheduledDate: "2026-08-02",
    scheduledTimeSlot: "10:00 AM - 12:00 PM",
    estimatedLaborHours: 2,
    laborRate: 95,
    partsCost: 140,
    totalCost: 330,
    beforeImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
    notes: ["Inspected motor coils", "Replaced jammed rotor cartridge"],
  },
  {
    id: "JOB-805",
    ticketNumber: "TKT-805",
    propertyTitle: "The Botanical Glass Loft",
    unitNumber: "Unit 4B",
    address: "1088 Park Ave, Upper West Side",
    tenantName: "Marcus Sterling",
    tenantPhone: "+1 (555) 876-5432",
    issueTitle: "Bathroom Faucet Valve Leak",
    description: "Hot water valve stem leaking under main vanity counter.",
    category: "PLUMBING",
    priority: "HIGH",
    status: "ASSIGNED",
    scheduledDate: "2026-08-04",
    scheduledTimeSlot: "02:00 PM - 04:00 PM",
    estimatedLaborHours: 1.5,
    laborRate: 95,
    partsCost: 25,
    totalCost: 167.5,
    notes: ["Waiting on site confirmation"],
  },
];

let completedJobsStore: VendorJob[] = [
  {
    id: "JOB-702",
    ticketNumber: "TKT-702",
    propertyTitle: "Urban Industrial Brick Studio",
    unitNumber: "Loft 204",
    address: "42 Wall St, Financial District",
    tenantName: "Carlos Ramos",
    tenantPhone: "+1 (555) 998-1122",
    issueTitle: "Water Heater Valve Maintenance",
    description: "Replaced faulty temperature relief valve and flushed sediment tank.",
    category: "PLUMBING",
    priority: "LOW",
    status: "COMPLETED",
    scheduledDate: "2026-07-15",
    estimatedLaborHours: 3,
    laborRate: 95,
    partsCost: 85,
    totalCost: 370,
    beforeImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
    afterImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
  },
];

let invoicesStore: VendorInvoice[] = [
  {
    id: "VINV-101",
    invoiceNumber: "VINV-2026-08",
    workOrderId: "TKT-804",
    propertyTitle: "Grand Horizon Luxury Penthouse",
    amountBilled: 330,
    taxAmount: 26.4,
    totalAmount: 356.4,
    submittedDate: "2026-07-28",
    dueDate: "2026-08-15",
    status: "PENDING",
    lineItems: [
      { id: "li-1", description: "Plumbing Labor (2 hrs @ $95/hr)", quantity: 2, unitPrice: 95, total: 190 },
      { id: "li-2", description: "1/2 HP Disposal Motor Part", quantity: 1, unitPrice: 140, total: 140 },
    ],
  },
  {
    id: "VINV-100",
    invoiceNumber: "VINV-2026-07",
    workOrderId: "TKT-702",
    propertyTitle: "Urban Industrial Brick Studio",
    amountBilled: 370,
    taxAmount: 29.6,
    totalAmount: 399.6,
    submittedDate: "2026-07-16",
    dueDate: "2026-07-30",
    status: "PAID",
    lineItems: [
      { id: "li-3", description: "Water Heater Service (3 hrs)", quantity: 3, unitPrice: 95, total: 285 },
      { id: "li-4", description: "Relief Valve Cartridge", quantity: 1, unitPrice: 85, total: 85 },
    ],
  },
];

let inventoryStore: InventoryItem[] = [
  { id: "INV-1", sku: "PLM-DISP-50", itemName: "1/2 HP Garbage Disposal Unit", category: "Plumbing", quantityInStock: 8, reorderLevel: 3, unitCost: 140, location: "Shelf A-3" },
  { id: "INV-2", sku: "PLM-VALV-BRS", itemName: "Brass Basin Faucet Cartridge", category: "Plumbing", quantityInStock: 24, reorderLevel: 10, unitCost: 25, location: "Bin B-12" },
  { id: "INV-3", sku: "HVAC-FLT-2020", itemName: "HVAC Air Filter 20x20x1", category: "HVAC", quantityInStock: 50, reorderLevel: 15, unitCost: 12, location: "Rack C-1" },
  { id: "INV-4", sku: "ELE-BRK-20A", itemName: "20A Single Pole Circuit Breaker", category: "Electrical", quantityInStock: 4, reorderLevel: 5, unitCost: 18, location: "Drawer E-2" },
];

let ratingDataStore: VendorRatingData = {
  averageRating: 4.9,
  totalReviews: 42,
  punctualityRating: 4.9,
  workmanshipRating: 5.0,
  communicationRating: 4.8,
  valueRating: 4.8,
  ratingDistribution: [
    { stars: 5, count: 38 },
    { stars: 4, count: 3 },
    { stars: 3, count: 1 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ],
  recentReviews: [
    {
      id: "REV-1",
      reviewerName: "Alexander Vance",
      reviewerRole: "OWNER",
      rating: 5,
      date: "July 16, 2026",
      comment: "Apex Plumbing arrived on time and repaired the water heater valve cleanly. Highly recommended!",
      reply: "Thank you Alexander! Glad we could resolve it quickly.",
      replyDate: "July 16, 2026",
    },
    {
      id: "REV-2",
      reviewerName: "Jane Doe",
      reviewerRole: "TENANT",
      rating: 5,
      date: "July 04, 2026",
      comment: "Super professional technician. Wore boot covers and left the kitchen spotless.",
    },
  ],
};

let settingsStore: VendorSettings = {
  companyName: "Apex Plumbing & Climate Services",
  taxId: "XX-XXX4920",
  licenseNumber: "LIC-PLM-994821",
  contactEmail: "dispatch@apexplumbing.com",
  contactPhone: "+1 (555) 432-8800",
  emergencyPhone: "+1 (555) 911-APEX",
  serviceCategories: ["PLUMBING", "HVAC"],
  coveredZipCodes: ["10001", "10002", "10003", "10011", "10012"],
  hourlyLaborRate: 95,
  emergencyCalloutFee: 150,
  bankName: "Chase Commercial Banking",
  accountNumberMasked: "••••••••4892",
  routingNumberMasked: "•••••0210",
  emailNotifications: true,
  smsAlerts: true,
};

export const vendorApi = {
  getAssignedJobs: async (): Promise<VendorJob[]> => {
    await delay(300);
    return [...jobsStore];
  },

  getCompletedJobs: async (): Promise<VendorJob[]> => {
    await delay(300);
    return [...completedJobsStore];
  },

  updateJobStatus: async (jobId: string, status: VendorJob["status"]): Promise<VendorJob> => {
    await delay(300);
    const job = jobsStore.find((j) => j.id === jobId);
    if (job) {
      job.status = status;
      if (status === "COMPLETED") {
        jobsStore = jobsStore.filter((j) => j.id !== jobId);
        completedJobsStore.unshift(job);
      }
      return job;
    }
    throw new Error("Job not found");
  },

  getVendorInvoices: async (): Promise<VendorInvoice[]> => {
    await delay(300);
    return [...invoicesStore];
  },

  createInvoice: async (invoice: Omit<VendorInvoice, "id" | "submittedDate">): Promise<VendorInvoice> => {
    await delay(400);
    const newInvoice: VendorInvoice = {
      ...invoice,
      id: `VINV-${Date.now().toString().slice(-4)}`,
      submittedDate: new Date().toISOString().split("T")[0],
    };
    invoicesStore.unshift(newInvoice);
    return newInvoice;
  },

  getVendorPayments: async (): Promise<VendorPayment[]> => {
    await delay(300);
    return [
      {
        id: "VPAY-501",
        paymentNumber: "VPAY-2026-07",
        amountPaid: 1250,
        paymentDate: "2026-07-20",
        method: "Direct Deposit (ACH)",
        grossAmount: 1300,
        platformFee: 50,
        netPayout: 1250,
        status: "COMPLETED",
      },
      {
        id: "VPAY-500",
        paymentNumber: "VPAY-2026-06",
        amountPaid: 2400,
        paymentDate: "2026-06-22",
        method: "Direct Deposit (ACH)",
        grossAmount: 2500,
        platformFee: 100,
        netPayout: 2400,
        status: "COMPLETED",
      },
    ];
  },

  getInventory: async (): Promise<InventoryItem[]> => {
    await delay(300);
    return [...inventoryStore];
  },

  addInventoryItem: async (item: Omit<InventoryItem, "id">): Promise<InventoryItem> => {
    await delay(300);
    const newItem: InventoryItem = {
      ...item,
      id: `INV-${Date.now().toString().slice(-4)}`,
    };
    inventoryStore.unshift(newItem);
    return newItem;
  },

  updateInventoryStock: async (id: string, newQuantity: number): Promise<InventoryItem> => {
    await delay(200);
    const item = inventoryStore.find((i) => i.id === id);
    if (item) {
      item.quantityInStock = newQuantity;
      return item;
    }
    throw new Error("Item not found");
  },

  getRatings: async (): Promise<VendorRatingData> => {
    await delay(300);
    return { ...ratingDataStore };
  },

  replyToReview: async (reviewId: string, replyText: string): Promise<VendorReview> => {
    await delay(300);
    const review = ratingDataStore.recentReviews.find((r) => r.id === reviewId);
    if (review) {
      review.reply = replyText;
      review.replyDate = "Just now";
      return review;
    }
    throw new Error("Review not found");
  },

  getVendorSettings: async (): Promise<VendorSettings> => {
    await delay(200);
    return { ...settingsStore };
  },

  updateVendorSettings: async (newSettings: Partial<VendorSettings>): Promise<VendorSettings> => {
    await delay(300);
    settingsStore = { ...settingsStore, ...newSettings };
    return settingsStore;
  },
};
