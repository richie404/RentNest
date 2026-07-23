import { z } from "zod";

export const advancedSearchSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    city: z.string().optional(),
    stateProvince: z.string().optional(),
    postalCode: z.string().optional(),
    propertyType: z.string().optional(),
    minRent: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxRent: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    minDeposit: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxDeposit: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    bedrooms: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    bathrooms: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    minSquareFeet: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    sortBy: z.enum(["rent_asc", "rent_desc", "newest", "rating_desc"]).optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

export const comparePropertiesSchema = z.object({
  body: z.object({
    propertyIds: z.array(z.number()).min(1, "At least one property ID must be provided"),
  }),
});

export const suggestionsSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
  }),
});
