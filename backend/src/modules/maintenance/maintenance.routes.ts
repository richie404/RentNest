import { Router } from "express";
import { MaintenanceController } from "./maintenance.controller";
import { MaintenanceService } from "./maintenance.service";
import { MaintenanceRepository } from "../../repositories/maintenance.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  createMaintenanceRequestSchema,
  assignVendorSchema,
  updateMaintenanceStatusSchema,
  getMaintenanceByIdSchema,
} from "./maintenance.validator";

const maintenanceRepository = new MaintenanceRepository();
const auditLogRepository = new AuditLogRepository();
const maintenanceService = new MaintenanceService(maintenanceRepository, auditLogRepository);
export const maintenanceController = new MaintenanceController(maintenanceService);

const router = Router();

// Require authentication for all maintenance endpoints
router.use(authenticateToken);

// Requests & Dispatching
router.post(
  "/requests",
  validateRequest(createMaintenanceRequestSchema),
  asyncHandler(maintenanceController.createRequest)
);

router.get("/requests", asyncHandler(maintenanceController.listRequests));

router.get(
  "/requests/:id",
  validateRequest(getMaintenanceByIdSchema),
  asyncHandler(maintenanceController.getRequestById)
);

router.patch(
  "/requests/:id/status",
  validateRequest(updateMaintenanceStatusSchema),
  asyncHandler(maintenanceController.updateStatus)
);

router.post(
  "/requests/:id/assign",
  requireRole(["ROLE_ADMIN", "ROLE_PROPERTY_OWNER", "ROLE_PROPERTY_MANAGER"]),
  validateRequest(assignVendorSchema),
  asyncHandler(maintenanceController.assignVendor)
);

// Dispatch Hub Summary
router.get(
  "/dispatch/summary",
  requireRole(["ROLE_ADMIN", "ROLE_PROPERTY_MANAGER"]),
  asyncHandler(maintenanceController.getDispatchSummary)
);

export default router;
