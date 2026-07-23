import { Router } from "express";
import { RbacController } from "./rbac.controller";
import { RbacService } from "./rbac.service";
import { RbacRepository } from "../../repositories/rbac.repository";
import { UserRepository } from "../../repositories/user.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  assignRoleSchema,
  revokeRoleSchema,
  assignPermissionsSchema,
  revokePermissionSchema,
  getRoleByIdSchema,
} from "./rbac.validator";

const rbacRepository = new RbacRepository();
const userRepository = new UserRepository();
const auditLogRepository = new AuditLogRepository();
const rbacService = new RbacService(rbacRepository, userRepository, auditLogRepository);
export const rbacController = new RbacController(rbacService);

const router = Router();

// Protect all RBAC management endpoints with authentication & admin role guard
router.use(authenticateToken);

router.get("/roles", requireRole(["ROLE_ADMIN", "ROLE_PROPERTY_MANAGER"]), asyncHandler(rbacController.getRoles));
router.get(
  "/roles/:roleId",
  requireRole(["ROLE_ADMIN", "ROLE_PROPERTY_MANAGER"]),
  validateRequest(getRoleByIdSchema),
  asyncHandler(rbacController.getRoleById)
);

router.get(
  "/permissions",
  requireRole(["ROLE_ADMIN", "ROLE_PROPERTY_MANAGER"]),
  asyncHandler(rbacController.getPermissions)
);

router.post(
  "/users/:userId/roles",
  requireRole(["ROLE_ADMIN"]),
  validateRequest(assignRoleSchema),
  asyncHandler(rbacController.assignRoleToUser)
);

router.delete(
  "/users/:userId/roles/:roleId",
  requireRole(["ROLE_ADMIN"]),
  validateRequest(revokeRoleSchema),
  asyncHandler(rbacController.revokeRoleFromUser)
);

router.post(
  "/roles/:roleId/permissions",
  requireRole(["ROLE_ADMIN"]),
  validateRequest(assignPermissionsSchema),
  asyncHandler(rbacController.assignPermissionsToRole)
);

router.delete(
  "/roles/:roleId/permissions/:permissionId",
  requireRole(["ROLE_ADMIN"]),
  validateRequest(revokePermissionSchema),
  asyncHandler(rbacController.revokePermissionFromRole)
);

export default router;
