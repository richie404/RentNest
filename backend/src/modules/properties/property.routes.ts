import { Router } from "express";
import { PropertyController } from "./property.controller";
import { PropertyService } from "./property.service";
import { PropertyRepository } from "../../repositories/property.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";

import { authenticateToken } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { uploadMiddleware } from "../../config/multer.config";
import { asyncHandler } from "../../utils/async-handler";

import {
  createPropertySchema,
  updatePropertySchema,
  createUnitSchema,
  updateUnitSchema,
  searchPropertiesSchema,
  submitReviewSchema,
  favoriteUnitSchema,
} from "./property.validator";

const propertyRepository = new PropertyRepository();
const auditLogRepository = new AuditLogRepository();
const propertyService = new PropertyService(propertyRepository, auditLogRepository);
export const propertyController = new PropertyController(propertyService);

const router = Router();

// Public Routes (Property Search & Details)
router.get(
  "/search",
  validateRequest(searchPropertiesSchema),
  asyncHandler(propertyController.searchProperties)
);

router.get(
  "/:id",
  asyncHandler(propertyController.getPropertyById)
);

router.get(
  "/:propertyId/reviews",
  asyncHandler(propertyController.getPropertyReviews)
);

// Protected Routes (Require Authentication)
router.use(authenticateToken);

// Favorites Management
router.get("/favorites/me", asyncHandler(propertyController.getUserFavorites));
router.post(
  "/units/:unitId/favorite",
  validateRequest(favoriteUnitSchema),
  asyncHandler(propertyController.favoriteUnit)
);
router.delete(
  "/units/:unitId/favorite",
  validateRequest(favoriteUnitSchema),
  asyncHandler(propertyController.unfavoriteUnit)
);

// Reviews Submission
router.post(
  "/reviews",
  validateRequest(submitReviewSchema),
  asyncHandler(propertyController.submitReview)
);

// Owner / Admin Property Management Routes
router.post(
  "/",
  requireRole(["ROLE_PROPERTY_OWNER", "ROLE_ADMIN"]),
  validateRequest(createPropertySchema),
  asyncHandler(propertyController.createProperty)
);

router.put(
  "/:id",
  requireRole(["ROLE_PROPERTY_OWNER", "ROLE_ADMIN"]),
  validateRequest(updatePropertySchema),
  asyncHandler(propertyController.updateProperty)
);

router.delete(
  "/:id",
  requireRole(["ROLE_PROPERTY_OWNER", "ROLE_ADMIN"]),
  asyncHandler(propertyController.deleteProperty)
);

router.post(
  "/:propertyId/units",
  requireRole(["ROLE_PROPERTY_OWNER", "ROLE_ADMIN"]),
  validateRequest(createUnitSchema),
  asyncHandler(propertyController.addUnit)
);

router.put(
  "/units/:unitId",
  requireRole(["ROLE_PROPERTY_OWNER", "ROLE_ADMIN"]),
  validateRequest(updateUnitSchema),
  asyncHandler(propertyController.updateUnit)
);

router.post(
  "/:propertyId/media",
  requireRole(["ROLE_PROPERTY_OWNER", "ROLE_ADMIN"]),
  uploadMiddleware.single("file"),
  asyncHandler(propertyController.uploadMedia)
);

// Admin Moderation Route
router.post(
  "/:id/approve",
  requireRole(["ROLE_ADMIN"]),
  asyncHandler(propertyController.approveProperty)
);

export default router;
