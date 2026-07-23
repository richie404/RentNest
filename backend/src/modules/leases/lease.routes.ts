import { Router } from "express";
import { LeaseController } from "./lease.controller";
import { LeaseService } from "./lease.service";
import { LeaseRepository } from "../../repositories/lease.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  createBookingSchema,
  createApplicationSchema,
  updateApplicationStatusSchema,
  terminateLeaseSchema,
  getLeaseByIdSchema,
} from "./lease.validator";

const leaseRepository = new LeaseRepository();
const auditLogRepository = new AuditLogRepository();
const leaseService = new LeaseService(leaseRepository, auditLogRepository);
export const leaseController = new LeaseController(leaseService);

const router = Router();

// Require authentication for all lease endpoints
router.use(authenticateToken);

// Booking Requests & Booking Execution
router.post(
  "/bookings",
  validateRequest(createBookingSchema),
  asyncHandler(leaseController.bookProperty)
);

// Rental Applications
router.post(
  "/applications",
  validateRequest(createApplicationSchema),
  asyncHandler(leaseController.submitApplication)
);

router.get("/applications", asyncHandler(leaseController.listApplications));

router.get(
  "/applications/:id",
  validateRequest(getLeaseByIdSchema),
  asyncHandler(leaseController.getApplicationById)
);

router.patch(
  "/applications/:id/status",
  requireRole(["ROLE_ADMIN", "ROLE_PROPERTY_OWNER", "ROLE_PROPERTY_MANAGER"]),
  validateRequest(updateApplicationStatusSchema),
  asyncHandler(leaseController.updateApplicationStatus)
);

// Lease Agreements & Signatures
router.get("/", asyncHandler(leaseController.listLeases));

router.get(
  "/:id",
  validateRequest(getLeaseByIdSchema),
  asyncHandler(leaseController.getLeaseById)
);

router.post(
  "/:id/sign",
  validateRequest(getLeaseByIdSchema),
  asyncHandler(leaseController.signLease)
);

router.post(
  "/:id/terminate",
  requireRole(["ROLE_ADMIN", "ROLE_PROPERTY_OWNER"]),
  validateRequest(terminateLeaseSchema),
  asyncHandler(leaseController.terminateLease)
);

export default router;
