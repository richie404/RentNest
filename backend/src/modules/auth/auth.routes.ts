import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepository } from "../../repositories/user.repository";
import { SessionRepository } from "../../repositories/session.repository";
import { SecurityTokenRepository } from "../../repositories/security-token.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";

import { authenticateToken } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { authRateLimiter } from "../../middleware/rate-limiter.middleware";
import { asyncHandler } from "../../utils/async-handler";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  sessionIdParamSchema,
} from "./auth.validator";

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const securityTokenRepository = new SecurityTokenRepository();
const auditLogRepository = new AuditLogRepository();

const authService = new AuthService(
  userRepository,
  sessionRepository,
  securityTokenRepository,
  auditLogRepository
);

export const authController = new AuthController(authService);

const router = Router();

// Public Authentication Endpoints
router.post(
  "/register",
  authRateLimiter,
  validateRequest(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema),
  asyncHandler(authController.login)
);

router.post(
  "/logout",
  asyncHandler(authController.logout)
);

router.post(
  "/refresh-token",
  asyncHandler(authController.refreshTokens)
);

router.post(
  "/verify-email",
  validateRequest(verifyEmailSchema),
  asyncHandler(authController.verifyEmail)
);

router.post(
  "/resend-verification",
  authRateLimiter,
  validateRequest(resendVerificationSchema),
  asyncHandler(authController.resendVerification)
);

router.post(
  "/forgot-password",
  authRateLimiter,
  validateRequest(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword)
);

router.post(
  "/reset-password",
  authRateLimiter,
  validateRequest(resetPasswordSchema),
  asyncHandler(authController.resetPassword)
);

// Protected Authentication & Session Endpoints
router.use(authenticateToken);

router.get("/me", asyncHandler(authController.getCurrentUser));

router.post(
  "/change-password",
  validateRequest(changePasswordSchema),
  asyncHandler(authController.changePassword)
);

router.post(
  "/verify-password",
  validateRequest(verifyPasswordSchema),
  asyncHandler(authController.verifyPassword)
);

router.get("/sessions", asyncHandler(authController.getUserSessions));

router.delete(
  "/sessions/:sessionId",
  validateRequest(sessionIdParamSchema),
  asyncHandler(authController.terminateSession)
);

export default router;
