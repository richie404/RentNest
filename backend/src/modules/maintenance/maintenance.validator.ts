import { z } from "zod";

export const createMaintenanceRequestSchema = z.object({
  body: z.object({
    unitId: z.number().int().positive("Unit ID must be a positive integer"),
    issueCategory: z.string().min(2, "Issue category is required"),
    priorityLevel: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"]).optional(),
    permissionToEnter: z.boolean().optional(),
    description: z.string().min(10, "Description must be at least 10 characters long"),
  }),
});

export const assignVendorSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    vendorId: z.number().int().positive("Vendor ID must be positive"),
  }),
});

export const updateMaintenanceStatusSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    note: z.string().optional(),
  }),
});

export const getMaintenanceByIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});
