import { MOCK_PROPERTIES } from "../data/mockProperties";
import type { PropertyData, VisitSchedulePayload, PropertyAnalyticsData } from "../types/property";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const propertyApi = {
  getProperties: async (filters?: { query?: string; type?: string }): Promise<PropertyData[]> => {
    await delay(400);
    let result = [...MOCK_PROPERTIES];

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.zipCode.includes(q)
      );
    }

    if (filters?.type && filters.type !== "ALL") {
      result = result.filter((p) => p.propertyType === filters.type);
    }

    return result;
  },

  getPropertyById: async (id: number): Promise<PropertyData> => {
    await delay(300);
    const item = MOCK_PROPERTIES.find((p) => p.id === id);
    if (!item) throw new Error("Property listing not found.");
    return item;
  },

  scheduleVisit: async (payload: VisitSchedulePayload): Promise<{ success: boolean; message: string }> => {
    await delay(600);
    return {
      success: true,
      message: `In-person visit scheduled for ${payload.visitDate} at ${payload.visitTime}. Confirmation sent to ${payload.visitorEmail}.`,
    };
  },

  getPropertyAnalytics: async (propertyId: number): Promise<PropertyAnalyticsData> => {
    await delay(500);
    return {
      propertyId,
      totalViews: 1420,
      totalInquiries: 84,
      applicationsSubmitted: 12,
      occupancyRate: 98.4,
      monthlyRevenue: [
        { month: "Jan", value: 4850 },
        { month: "Feb", value: 4850 },
        { month: "Mar", value: 4850 },
        { month: "Apr", value: 4850 },
        { month: "May", value: 4850 },
        { month: "Jun", value: 4850 },
      ],
    };
  },
};
