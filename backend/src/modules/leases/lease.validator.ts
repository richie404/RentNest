import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    unitId: z.number().int().positive("Unit ID must be a positive integer"),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be ISO format (YYYY-MM-DD)"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be ISO format (YYYY-MM-DD)"),
    monthlyRent: z.number().positive("Monthly rent must be positive"),
  }),
});

export const createApplicationSchema = z.object({
  body: z.object({
    unitId: z.number().int().positive("Unit ID must be a positive integer"),
    desiredMoveInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Move in date must be ISO format (YYYY-MM-DD)"),
    proposedLeaseMonths: z.number().int().min(1).max(36).optional(),
    declaredOccupantsCount: z.number().int().min(1).optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    status: z.enum(["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"]),
  }),
});

export const terminateLeaseSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    reason: z.string().min(5, "Reason must be at least 5 characters"),
  }),
});

export const getLeaseByIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});
