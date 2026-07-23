import { z } from "zod";

export const createPropertySchema = z.object({
  body: z.object({
    propertyName: z.string().min(2, "Property name must be at least 2 characters"),
    propertyType: z.enum(["APARTMENT", "SINGLE_FAMILY", "MULTI_FAMILY", "CONDO", "COMMERCIAL"]),
    streetAddress: z.string().min(3, "Street address is required"),
    city: z.string().min(2, "City is required"),
    stateProvince: z.string().min(2, "State or Province is required"),
    postalCode: z.string().min(2, "Postal code is required"),
    country: z.string().optional(),
    unitNumber: z.string().min(1, "Unit number is required"),
    bedrooms: z.number().int().min(0, "Bedrooms must be non-negative"),
    bathrooms: z.number().min(0, "Bathrooms must be non-negative"),
    targetRent: z.number().positive("Target rent must be positive"),
    deposit: z.number().min(0, "Deposit must be non-negative"),
    squareFeet: z.number().positive().optional(),
  }),
});

export const updatePropertySchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    propertyName: z.string().min(2).optional(),
    propertyType: z.enum(["APARTMENT", "SINGLE_FAMILY", "MULTI_FAMILY", "CONDO", "COMMERCIAL"]).optional(),
    streetAddress: z.string().min(3).optional(),
    city: z.string().min(2).optional(),
    stateProvince: z.string().min(2).optional(),
    postalCode: z.string().min(2).optional(),
    country: z.string().optional(),
  }),
});

export const createUnitSchema = z.object({
  params: z.object({
    propertyId: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    unitNumber: z.string().min(1, "Unit number is required"),
    bedrooms: z.number().int().min(0),
    bathrooms: z.number().min(0),
    squareFeet: z.number().positive().optional(),
    targetRent: z.number().positive(),
    securityDepositTarget: z.number().min(0),
    status: z.enum(["VACANT", "OCCUPIED", "UNDER_MAINTENANCE", "RESERVED"]).optional(),
  }),
});

export const updateUnitSchema = z.object({
  params: z.object({
    unitId: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    unitNumber: z.string().min(1).optional(),
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().min(0).optional(),
    squareFeet: z.number().positive().optional(),
    targetRent: z.number().positive().optional(),
    securityDepositTarget: z.number().min(0).optional(),
    status: z.enum(["VACANT", "OCCUPIED", "UNDER_MAINTENANCE", "RESERVED"]).optional(),
  }),
});

export const searchPropertiesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    city: z.string().optional(),
    stateProvince: z.string().optional(),
    propertyType: z.string().optional(),
    minRent: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxRent: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    bedrooms: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    bathrooms: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    search: z.string().optional(),
    sortBy: z.enum(["rent_asc", "rent_desc", "newest", "rating"]).optional(),
  }),
});

export const submitReviewSchema = z.object({
  body: z.object({
    leaseId: z.number().int().positive(),
    revieweeUserId: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    reviewText: z.string().min(5, "Review text must be at least 5 characters"),
  }),
});

export const favoriteUnitSchema = z.object({
  params: z.object({
    unitId: z.string().transform((val) => parseInt(val, 10)),
  }),
});
