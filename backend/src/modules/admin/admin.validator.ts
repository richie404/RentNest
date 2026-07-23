import { z } from "zod";

export const impersonateUserSchema = z.object({
  body: z.object({
    targetUserId: z.number().int().positive("Target User ID must be positive"),
  }),
});

export const globalSearchSchema = z.object({
  query: z.object({
    q: z.string().min(2, "Search query must be at least 2 characters"),
  }),
});
