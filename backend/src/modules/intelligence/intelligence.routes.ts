import { Router } from "express";
import { IntelligenceController } from "./intelligence.controller";
import { IntelligenceService } from "./intelligence.service";
import { IntelligenceRepository } from "../../repositories/intelligence.repository";
import { AIService } from "../../services/ai.service";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  semanticSearchSchema,
  analyzeSentimentSchema,
  categorizeMaintenanceSchema,
} from "./intelligence.validator";

const intelligenceRepository = new IntelligenceRepository();
const aiService = new AIService();
const intelligenceService = new IntelligenceService(intelligenceRepository, aiService);
export const intelligenceController = new IntelligenceController(intelligenceService);

const router = Router();

// Public & Authenticated AI Endpoints
router.get(
  "/search",
  validateRequest(semanticSearchSchema),
  asyncHandler(intelligenceController.semanticSearch)
);

router.post(
  "/sentiment",
  authenticateToken,
  validateRequest(analyzeSentimentSchema),
  asyncHandler(intelligenceController.analyzeSentiment)
);

router.post(
  "/categorize-maintenance",
  authenticateToken,
  validateRequest(categorizeMaintenanceSchema),
  asyncHandler(intelligenceController.categorizeMaintenance)
);

router.get(
  "/fraud-risk/:id",
  authenticateToken,
  requireRole(["ROLE_ADMIN", "ROLE_PROPERTY_OWNER", "ROLE_PROPERTY_MANAGER"]),
  asyncHandler(intelligenceController.getFraudRiskFlags)
);

export default router;
