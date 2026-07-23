import { z } from "zod";

export const exportAnalyticsSchema = z.object({
  query: z.object({
    format: z.enum(["CSV", "EXCEL", "PDF"]),
    reportType: z.enum(["REVENUE", "OCCUPANCY", "MAINTENANCE"]),
  }),
});
