import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../src/modules/auth/auth.service";
import { UserRepository } from "../src/repositories/user.repository";
import { SessionRepository } from "../src/repositories/session.repository";
import { SecurityTokenRepository } from "../src/repositories/security-token.repository";
import { AuditLogRepository } from "../src/repositories/audit-log.repository";
import { hashPassword } from "../src/utils/password.util";
import { ConflictError, UnauthorizedError, BadRequestError } from "../src/utils/app-error";

describe("AuthService Unit Tests", () => {
  let authService: AuthService;
  let mockUserRepository: any;
  let mockSessionRepository: any;
  let mockSecurityTokenRepository: any;
  let mockAuditLogRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmailWithDetails: vi.fn(),
      findByIdWithDetails: vi.fn(),
      registerUser: vi.fn(),
      updateAccountStatus: vi.fn(),
      updatePassword: vi.fn(),
    };

    mockSessionRepository = {
      createSession: vi.fn(),
      findActiveSession: vi.fn(),
      revokeSession: vi.fn(),
      revokeAllUserSessions: vi.fn(),
    };

    mockSecurityTokenRepository = {
      createToken: vi.fn(),
      findValidToken: vi.fn(),
      markTokenUsed: vi.fn(),
    };

    mockAuditLogRepository = {
      logAction: vi.fn(),
    };

    authService = new AuthService(
      mockUserRepository as UserRepository,
      mockSessionRepository as SessionRepository,
      mockSecurityTokenRepository as SecurityTokenRepository,
      mockAuditLogRepository as AuditLogRepository
    );
  });

  describe("Register User", () => {
    it("should throw ConflictError if email already exists", async () => {
      mockUserRepository.findByEmailWithDetails.mockResolvedValue({ userId: 1, email: "test@example.com" });

      await expect(
        authService.register({
          email: "test@example.com",
          password: "Password123!",
          roleName: "ROLE_TENANT",
          firstName: "John",
          lastName: "Doe",
        })
      ).rejects.toThrow(ConflictError);
    });

    it("should register new user successfully", async () => {
      mockUserRepository.findByEmailWithDetails.mockResolvedValue(null);
      mockUserRepository.registerUser.mockResolvedValue({
        userId: 101,
        statusMessage: "SUCCESS: User identity and profile created successfully.",
      });

      const result = await authService.register({
        email: "newtenant@example.com",
        password: "Password123!",
        roleName: "ROLE_TENANT",
        firstName: "Jane",
        lastName: "Doe",
      });

      expect(result.userId).toBe(101);
      expect(result.verificationToken).toBeDefined();
      expect(mockSecurityTokenRepository.createToken).toHaveBeenCalled();
      expect(mockAuditLogRepository.logAction).toHaveBeenCalled();
    });
  });

  describe("Login", () => {
    it("should throw UnauthorizedError on invalid email", async () => {
      mockUserRepository.findByEmailWithDetails.mockResolvedValue(null);

      await expect(
        authService.login({ email: "wrong@example.com", password: "Password123!" })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError on incorrect password", async () => {
      const hashedPassword = await hashPassword("RealPassword123!");
      mockUserRepository.findByEmailWithDetails.mockResolvedValue({
        userId: 10,
        email: "user@example.com",
        passwordHash: hashedPassword,
        accountStatus: "ACTIVE",
        roleId: 1,
        roleName: "ROLE_TENANT",
        firstName: "User",
        lastName: "One",
        permissions: ["tenant:read"],
      });

      await expect(
        authService.login({ email: "user@example.com", password: "WrongPassword" })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should login successfully and return access token & refresh token", async () => {
      const hashedPassword = await hashPassword("CorrectPassword123!");
      mockUserRepository.findByEmailWithDetails.mockResolvedValue({
        userId: 10,
        email: "user@example.com",
        passwordHash: hashedPassword,
        accountStatus: "ACTIVE",
        roleId: 1,
        roleName: "ROLE_TENANT",
        firstName: "User",
        lastName: "One",
        permissions: ["tenant:read"],
      });

      const result = await authService.login({
        email: "user@example.com",
        password: "CorrectPassword123!",
      });

      expect(result.authData.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.authData.user.email).toBe("user@example.com");
      expect(mockSessionRepository.createSession).toHaveBeenCalled();
    });
  });

  describe("Email Verification", () => {
    it("should verify email with valid token", async () => {
      mockSecurityTokenRepository.findValidToken.mockResolvedValue({
        token_id: 1,
        user_id: 10,
        token_type: "EMAIL_VERIFICATION",
      });

      await authService.verifyEmail("valid-token-string");

      expect(mockUserRepository.updateAccountStatus).toHaveBeenCalledWith(10, "ACTIVE");
      expect(mockSecurityTokenRepository.markTokenUsed).toHaveBeenCalledWith(1);
    });

    it("should throw BadRequestError on invalid token", async () => {
      mockSecurityTokenRepository.findValidToken.mockResolvedValue(null);

      await expect(authService.verifyEmail("invalid-token")).rejects.toThrow(BadRequestError);
    });
  });

  describe("Forgot & Reset Password", () => {
    it("should generate reset token for existing user", async () => {
      mockUserRepository.findByEmailWithDetails.mockResolvedValue({ userId: 5, email: "user@test.com" });

      const token = await authService.forgotPassword("user@test.com");

      expect(token).toBeDefined();
      expect(mockSecurityTokenRepository.createToken).toHaveBeenCalled();
    });

    it("should reset password and revoke user sessions", async () => {
      mockSecurityTokenRepository.findValidToken.mockResolvedValue({
        token_id: 2,
        user_id: 5,
        token_type: "PASSWORD_RESET",
      });

      await authService.resetPassword("valid-reset-token", "NewPassword123!");

      expect(mockUserRepository.updatePassword).toHaveBeenCalled();
      expect(mockSecurityTokenRepository.markTokenUsed).toHaveBeenCalledWith(2);
      expect(mockSessionRepository.revokeAllUserSessions).toHaveBeenCalledWith(5);
    });
  });
});
