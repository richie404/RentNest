import { z } from "zod";

export const semanticSearchSchema = z.object({
  query: z.object({
    q: z.string().min(2, "Search query must be at least 2 characters"),
  }),
});

export const analyzeSentimentSchema = z.object({
  body: z.object({
    reviewText: z.string().min(5, "Review text must be at least 5 characters"),
  }),
});

export const categorizeMaintenanceSchema = z.object({
  body: z.object({
    issueDescription: z.string().min(5, "Issue description must be at least 5 characters"),
  }),
});
