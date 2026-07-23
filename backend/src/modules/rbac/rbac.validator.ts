import { z } from "zod";

export const assignRoleSchema = z.object({
  params: z.object({
    userId: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    roleId: z.number().int().positive("Valid role ID is required"),
  }),
});

export const revokeRoleSchema = z.object({
  params: z.object({
    userId: z.string().transform((val) => parseInt(val, 10)),
    roleId: z.string().transform((val) => parseInt(val, 10)),
  }),
});

export const assignPermissionsSchema = z.object({
  params: z.object({
    roleId: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    permissionIds: z
      .array(z.number().int().positive())
      .min(1, "At least one permission ID is required"),
  }),
});

export const revokePermissionSchema = z.object({
  params: z.object({
    roleId: z.string().transform((val) => parseInt(val, 10)),
    permissionId: z.string().transform((val) => parseInt(val, 10)),
  }),
});

export const getRoleByIdSchema = z.object({
  params: z.object({
    roleId: z.string().transform((val) => parseInt(val, 10)),
  }),
});
