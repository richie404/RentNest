import { Router } from "express";
import { FinancialController } from "./financial.controller";
import { FinancialService } from "./financial.service";
import { FinancialRepository } from "../../repositories/financial.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  generateInvoiceSchema,
  recordPaymentSchema,
  getInvoiceByIdSchema,
} from "./financial.validator";

const financialRepository = new FinancialRepository();
const auditLogRepository = new AuditLogRepository();
const financialService = new FinancialService(financialRepository, auditLogRepository);
export const financialController = new FinancialController(financialService);

const router = Router();

// Require authentication for all financial endpoints
router.use(authenticateToken);

// Invoices
router.post(
  "/invoices",
  requireRole(["ROLE_ADMIN", "ROLE_PROPERTY_OWNER", "ROLE_PROPERTY_MANAGER"]),
  validateRequest(generateInvoiceSchema),
  asyncHandler(financialController.generateInvoice)
);

router.get("/invoices", asyncHandler(financialController.listInvoices));

router.get(
  "/invoices/:id",
  validateRequest(getInvoiceByIdSchema),
  asyncHandler(financialController.getInvoiceById)
);

// Payments
router.post(
  "/payments",
  validateRequest(recordPaymentSchema),
  asyncHandler(financialController.recordPayment)
);

// Reports & Financial Analytics
router.get(
  "/reports/revenue",
  requireRole(["ROLE_ADMIN", "ROLE_FINANCE_OFFICER"]),
  asyncHandler(financialController.getRevenueSummary)
);

router.get(
  "/reports/owner-summary",
  requireRole(["ROLE_PROPERTY_OWNER"]),
  asyncHandler(financialController.getOwnerDashboardSummary)
);

export default router;
