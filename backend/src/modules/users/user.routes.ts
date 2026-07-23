import { Router } from "express";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "../../repositories/user.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  listUsersSchema,
  getUserByIdSchema,
  updateProfileSchema,
  updateStatusSchema,
  adminResetPasswordSchema,
} from "./user.validator";

const userRepository = new UserRepository();
const auditLogRepository = new AuditLogRepository();
const userService = new UserService(userRepository, auditLogRepository);
export const userController = new UserController(userService);

const router = Router();

// Require authentication for all user endpoints
router.use(authenticateToken);

router.get(
  "/",
  requireRole(["ROLE_ADMIN", "ROLE_PROPERTY_MANAGER"]),
  validateRequest(listUsersSchema),
  asyncHandler(userController.getUsers)
);

router.get(
  "/:id",
  validateRequest(getUserByIdSchema),
  asyncHandler(userController.getUserById)
);

router.put(
  "/:id/profile",
  validateRequest(updateProfileSchema),
  asyncHandler(userController.updateProfile)
);

router.patch(
  "/:id/status",
  requireRole(["ROLE_ADMIN"]),
  validateRequest(updateStatusSchema),
  asyncHandler(userController.updateStatus)
);

router.post(
  "/:id/reset-password",
  requireRole(["ROLE_ADMIN"]),
  validateRequest(adminResetPasswordSchema),
  asyncHandler(userController.adminResetPassword)
);

router.post(
  "/:id/force-logout",
  requireRole(["ROLE_ADMIN"]),
  validateRequest(getUserByIdSchema),
  asyncHandler(userController.adminForceLogout)
);

router.get(
  "/:id/audit-history",
  requireRole(["ROLE_ADMIN"]),
  validateRequest(getUserByIdSchema),
  asyncHandler(userController.getAuditHistory)
);

export default router;
