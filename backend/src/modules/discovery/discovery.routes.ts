import { Router } from "express";
import { DiscoveryController } from "./discovery.controller";
import { DiscoveryService } from "./discovery.service";
import { DiscoveryRepository } from "../../repositories/discovery.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { validateRequest } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  advancedSearchSchema,
  comparePropertiesSchema,
  suggestionsSchema,
} from "./discovery.validator";

const discoveryRepository = new DiscoveryRepository();
const auditLogRepository = new AuditLogRepository();
const discoveryService = new DiscoveryService(discoveryRepository, auditLogRepository);
export const discoveryController = new DiscoveryController(discoveryService);

const router = Router();

router.get(
  "/search",
  validateRequest(advancedSearchSchema),
  asyncHandler(discoveryController.search)
);

router.get("/recommendations", asyncHandler(discoveryController.getRecommendations));

router.post(
  "/compare",
  validateRequest(comparePropertiesSchema),
  asyncHandler(discoveryController.compareProperties)
);

router.get(
  "/suggestions",
  validateRequest(suggestionsSchema),
  asyncHandler(discoveryController.getSuggestions)
);

export default router;
