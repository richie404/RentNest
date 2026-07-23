import { Router } from "express";
import { CommunicationController } from "./communication.controller";
import { CommunicationService } from "./communication.service";
import { CommunicationRepository } from "../../repositories/communication.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  createConversationSchema,
  sendMessageSchema,
  sendNotificationSchema,
  getConversationByIdSchema,
} from "./communication.validator";

const communicationRepository = new CommunicationRepository();
const auditLogRepository = new AuditLogRepository();
const communicationService = new CommunicationService(
  communicationRepository,
  auditLogRepository
);
export const communicationController = new CommunicationController(communicationService);

const router = Router();

// Require authentication for all communication endpoints
router.use(authenticateToken);

// Conversations & Messaging
router.post(
  "/conversations",
  validateRequest(createConversationSchema),
  asyncHandler(communicationController.createConversation)
);

router.post(
  "/messages",
  validateRequest(sendMessageSchema),
  asyncHandler(communicationController.sendMessage)
);

router.get(
  "/conversations/:id/messages",
  validateRequest(getConversationByIdSchema),
  asyncHandler(communicationController.listMessages)
);

// Notifications
router.post(
  "/notifications",
  requireRole(["ROLE_ADMIN", "ROLE_PROPERTY_MANAGER"]),
  validateRequest(sendNotificationSchema),
  asyncHandler(communicationController.sendNotification)
);

router.get("/notifications", asyncHandler(communicationController.listNotifications));

export default router;
