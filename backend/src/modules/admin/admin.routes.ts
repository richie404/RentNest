import { Router } from "express";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AdminRepository } from "../../repositories/admin.repository";
import { UserRepository } from "../../repositories/user.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { impersonateUserSchema, globalSearchSchema } from "./admin.validator";

const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const auditLogRepository = new AuditLogRepository();
const adminService = new AdminService(adminRepository, userRepository, auditLogRepository);
export const adminController = new AdminController(adminService);

const router = Router();

// Strictly guard all administration routes with ROLE_ADMIN
router.use(authenticateToken);
router.use(requireRole(["ROLE_ADMIN"]));

router.post(
  "/impersonate",
  validateRequest(impersonateUserSchema),
  asyncHandler(adminController.impersonateUser)
);

router.get("/audit-logs", asyncHandler(adminController.getAuditLogs));

router.get(
  "/search",
  validateRequest(globalSearchSchema),
  asyncHandler(adminController.globalSearch)
);

router.get("/security-dashboard", asyncHandler(adminController.getSecurityDashboardMetrics));

export default router;
