import type {
  MaintenanceTicket,
  MaintenanceComment,
  InspectionChecklist,
  BeforeAfterMedia,
  MaintenanceInvoiceDetails,
} from "../types/maintenance";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let ticketsStore: MaintenanceTicket[] = [
  {
    id: "TKT-804",
    ticketNumber: "TKT-804",
    propertyTitle: "Grand Horizon Luxury Penthouse",
    unitNumber: "Suite 4501",
    tenantName: "Jane Doe",
    category: "PLUMBING",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    issueTitle: "Kitchen Disposal Motor Replacement",
    description: "Disposal unit is jammed and failing to spin.",
    permissionToEnter: true,
    preferredDate: "2026-08-02",
    preferredTimeSlot: "10:00 AM - 12:00 PM",
    vendorName: "Apex Plumbing Services",
    vendorPhone: "+1 (555) 432-8800",
    submittedAt: "2026-07-22",
    estimatedLaborHours: 2,
    media: {
      beforeUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
      beforeNotes: "Initial inspection shows rotor jam.",
    },
    inspection: {
      inspectorName: "David Miller (Licensed Inspector)",
      inspectionDate: "2026-07-23",
      safetyPassed: true,
      sanitized: true,
      notes: "Pre-repair safety clear. No gas leak.",
    },
    comments: [
      { id: "c-1", authorName: "Jane Doe", authorRole: "TENANT", text: "Water is backed up in the sink basin.", timestamp: "July 22, 10:30 AM" },
      { id: "c-2", authorName: "Alexander Vance", authorRole: "OWNER", text: "Approved Apex Plumbing to replace motor.", timestamp: "July 22, 11:15 AM" },
    ],
    invoice: {
      id: "INV-804",
      invoiceNumber: "VINV-2026-08",
      laborHours: 2,
      laborRate: 95,
      partsTotal: 140,
      serviceFee: 25,
      total: 355,
      status: "PENDING_APPROVAL",
      items: [
        { id: "i1", description: "Plumbing Labor (2 hrs)", amount: 190 },
        { id: "i2", description: "1/2 HP Disposal Unit", amount: 140 },
        { id: "i3", description: "Platform Service Fee", amount: 25 },
      ],
    },
    timeline: [
      { title: "Ticket Submitted", description: "Created by Tenant Jane Doe", timestamp: "July 22, 10:30 AM", actor: "Jane Doe", completed: true },
      { title: "Estimate Authorized", description: "Approved by Owner Alexander Vance", timestamp: "July 22, 11:15 AM", actor: "Alexander Vance", completed: true },
      { title: "Vendor Dispatched", description: "Assigned to Apex Plumbing Services", timestamp: "July 22, 02:00 PM", actor: "System", completed: true },
      { title: "Inspection Passed", description: "Pre-repair safety checklist verified", timestamp: "July 23, 09:00 AM", actor: "David Miller", completed: true },
      { title: "Work In Progress", description: "Technician on site", timestamp: "July 23, 10:00 AM", actor: "Apex Plumbing", completed: true },
      { title: "Repair Completed", description: "Pending sign-off & invoice authorization", timestamp: "Pending", actor: "Vendor", completed: false },
    ],
  },
];

export const maintenanceApi = {
  getTickets: async (): Promise<MaintenanceTicket[]> => {
    await delay(300);
    return [...ticketsStore];
  },

  getTicketById: async (id: string): Promise<MaintenanceTicket | undefined> => {
    await delay(200);
    return ticketsStore.find((t) => t.id === id || t.ticketNumber === id);
  },

  createTicket: async (ticketData: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> => {
    await delay(400);
    const newId = `TKT-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: MaintenanceTicket = {
      id: newId,
      ticketNumber: newId,
      propertyTitle: ticketData.propertyTitle || "Grand Horizon Penthouse",
      unitNumber: ticketData.unitNumber || "Suite 4501",
      tenantName: ticketData.tenantName || "Jane Doe",
      category: ticketData.category || "PLUMBING",
      priority: ticketData.priority || "MEDIUM",
      status: "OPEN",
      issueTitle: ticketData.issueTitle || "Maintenance Issue",
      description: ticketData.description || "",
      permissionToEnter: ticketData.permissionToEnter ?? true,
      preferredDate: ticketData.preferredDate || new Date().toISOString().split("T")[0],
      submittedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      timeline: [
        { title: "Ticket Submitted", description: "Created by Tenant", timestamp: "Just now", actor: "Tenant", completed: true },
        { title: "Owner Review", description: "Pending estimate authorization", timestamp: "Pending", actor: "Owner", completed: false },
      ],
    };
    ticketsStore.unshift(newTicket);
    return newTicket;
  },

  assignVendor: async (ticketId: string, vendorName: string, vendorPhone: string): Promise<MaintenanceTicket> => {
    await delay(300);
    const ticket = ticketsStore.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.vendorName = vendorName;
      ticket.vendorPhone = vendorPhone;
      ticket.status = "DISPATCHED";
      return ticket;
    }
    throw new Error("Ticket not found");
  },

  addComment: async (ticketId: string, text: string, authorName: string, authorRole: string): Promise<MaintenanceComment> => {
    await delay(200);
    const ticket = ticketsStore.find((t) => t.id === ticketId);
    const comment: MaintenanceComment = {
      id: `c-${Date.now()}`,
      authorName,
      authorRole,
      text,
      timestamp: "Just now",
    };
    if (ticket) {
      if (!ticket.comments) ticket.comments = [];
      ticket.comments.push(comment);
      return comment;
    }
    throw new Error("Ticket not found");
  },

  approveInvoice: async (ticketId: string): Promise<MaintenanceInvoiceDetails> => {
    await delay(300);
    const ticket = ticketsStore.find((t) => t.id === ticketId);
    if (ticket && ticket.invoice) {
      ticket.invoice.status = "APPROVED";
      return ticket.invoice;
    }
    throw new Error("Invoice not found");
  },

  completeTicket: async (ticketId: string, rating: number, feedback: string): Promise<MaintenanceTicket> => {
    await delay(300);
    const ticket = ticketsStore.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = "COMPLETED";
      ticket.rating = rating;
      ticket.feedback = feedback;
      if (ticket.media) {
        ticket.media.afterUrl = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80";
        ticket.media.afterNotes = "Disposal unit replaced and tested. Zero leaks.";
      }
      return ticket;
    }
    throw new Error("Ticket not found");
  },
};
