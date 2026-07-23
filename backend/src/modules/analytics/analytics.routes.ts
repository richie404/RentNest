import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsRepository } from "../../repositories/analytics.repository";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { exportAnalyticsSchema } from "./analytics.validator";

const analyticsRepository = new AnalyticsRepository();
const analyticsService = new AnalyticsService(analyticsRepository);
export const analyticsController = new AnalyticsController(analyticsService);

const router = Router();

// Guard all analytics routes for ADMIN / FINANCE / PROPERTY_MANAGER roles
router.use(authenticateToken);
router.use(requireRole(["ROLE_ADMIN", "ROLE_FINANCE_OFFICER", "ROLE_PROPERTY_MANAGER", "ROLE_PROPERTY_OWNER"]));

// Dashboard APIs
router.get("/executive-summary", asyncHandler(analyticsController.getAdminExecutiveSummary));
router.get("/occupancy", asyncHandler(analyticsController.getOccupancyAnalytics));
router.get("/revenue", asyncHandler(analyticsController.getRevenueTrends));
router.get("/maintenance", asyncHandler(analyticsController.getMaintenanceAnalytics));

// Export API
router.get(
  "/export",
  validateRequest(exportAnalyticsSchema),
  asyncHandler(analyticsController.exportReport)
);

export default router;
