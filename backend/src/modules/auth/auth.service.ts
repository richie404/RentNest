import crypto from "crypto";
import { UserRepository } from "../../repositories/user.repository";
import { SessionRepository } from "../../repositories/session.repository";
import { SecurityTokenRepository } from "../../repositories/security-token.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { hashPassword, comparePassword } from "../../utils/password.util";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.util";
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../../utils/app-error";
import { RegisterDTO, LoginDTO, AuthResponseData } from "../../types/auth.types";
import { logger } from "../../utils/logger";

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private securityTokenRepository: SecurityTokenRepository,
    private auditLogRepository: AuditLogRepository
  ) {}

  /**
   * Register a new user identity
   */
  public async register(
    dto: RegisterDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ userId: number; verificationToken: string }> {
    const existing = await this.userRepository.findByEmailWithDetails(dto.email);
    if (existing) {
      throw new ConflictError(`Email address '${dto.email}' is already registered.`);
    }

    const hashedPassword = await hashPassword(dto.password);
    const { userId, statusMessage } = await this.userRepository.registerUser(
      dto,
      hashedPassword
    );

    if (userId === 0 || statusMessage.startsWith("ERROR")) {
      throw new BadRequestError(statusMessage || "Registration failed.");
    }

    // Generate email verification token
    const verificationRawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(verificationRawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await this.securityTokenRepository.createToken(
      userId,
      "EMAIL_VERIFICATION",
      tokenHash,
      expiresAt
    );

    // Audit log entry
    await this.auditLogRepository.logAction({
      actorUserId: userId,
      actionType: "INSERT",
      targetTable: "users",
      recordKey: String(userId),
      userAgent,
      ipAddress,
      postImageJson: { email: dto.email, role: dto.roleName },
    });

    logger.info(`👤 Registered new user ID ${userId} [${dto.email}] as ${dto.roleName}`);
    return { userId, verificationToken: verificationRawToken };
  }

  /**
   * Authenticate user credentials and establish session
   */
  public async login(
    dto: LoginDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ authData: AuthResponseData; refreshToken: string }> {
    const user = await this.userRepository.findByEmailWithDetails(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const isMatch = await comparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      // Audit failed login attempt
      await this.auditLogRepository.logAction({
        actorUserId: user.userId,
        actionType: "UPDATE",
        targetTable: "users",
        recordKey: String(user.userId),
        userAgent,
        ipAddress,
        postImageJson: { loginStatus: "FAILED_INVALID_PASSWORD" },
      });
      throw new UnauthorizedError("Invalid email or password.");
    }

    if (user.accountStatus === "SUSPENDED") {
      throw new UnauthorizedError("Your account has been suspended. Contact support.");
    }

    // Generate Access and Refresh JWT Tokens
    const accessTokenPayload = {
      userId: user.userId,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      permissions: user.permissions,
    };

    const accessToken = generateAccessToken(accessTokenPayload);
    const refreshToken = generateRefreshToken({ userId: user.userId });

    // Hash refresh token for DB session storage
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.sessionRepository.createSession(
      user.userId,
      refreshTokenHash,
      expiresAt,
      userAgent,
      ipAddress
    );

    // Audit log
    await this.auditLogRepository.logAction({
      actorUserId: user.userId,
      actionType: "INSERT",
      targetTable: "user_sessions",
      recordKey: String(user.userId),
      userAgent,
      ipAddress,
      postImageJson: { loginStatus: "SUCCESS" },
    });

    const authData: AuthResponseData = {
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleName: user.roleName,
        accountStatus: user.accountStatus,
        permissions: user.permissions,
      },
      accessToken,
    };

    return { authData, refreshToken };
  }

  /**
   * Terminate user session
   */
  public async logout(
    refreshToken: string | undefined,
    userId?: number
  ): Promise<void> {
    if (refreshToken) {
      const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      await this.sessionRepository.revokeSession(tokenHash);
    }

    if (userId) {
      await this.auditLogRepository.logAction({
        actorUserId: userId,
        actionType: "UPDATE",
        targetTable: "user_sessions",
        recordKey: String(userId),
        postImageJson: { sessionStatus: "LOGGED_OUT" },
      });
    }
  }

  /**
   * Issue new Access Token via valid Refresh Token
   */
  public async refreshTokens(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ authData: AuthResponseData; newRefreshToken: string }> {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await this.sessionRepository.findActiveSession(tokenHash);
    if (!session) {
      throw new UnauthorizedError("Session has been revoked or expired.");
    }

    const user = await this.userRepository.findByIdWithDetails(payload.userId);
    if (!user || user.accountStatus === "SUSPENDED") {
      throw new UnauthorizedError("User account is inactive or missing.");
    }

    // Revoke old session
    await this.sessionRepository.revokeSession(tokenHash);

    // Generate new Token Pair
    const accessTokenPayload = {
      userId: user.userId,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      permissions: user.permissions,
    };

    const accessToken = generateAccessToken(accessTokenPayload);
    const newRefreshToken = generateRefreshToken({ userId: user.userId });
    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.sessionRepository.createSession(
      user.userId,
      newRefreshTokenHash,
      expiresAt,
      userAgent,
      ipAddress
    );

    const authData: AuthResponseData = {
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleName: user.roleName,
        accountStatus: user.accountStatus,
        permissions: user.permissions,
      },
      accessToken,
    };

    return { authData, newRefreshToken };
  }

  /**
   * Verify email address via verification token
   */
  public async verifyEmail(token: string): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = await this.securityTokenRepository.findValidToken(
      "EMAIL_VERIFICATION",
      tokenHash
    );

    if (!record) {
      throw new BadRequestError("Invalid or expired verification token.");
    }

    await this.userRepository.updateAccountStatus(record.user_id, "ACTIVE");
    await this.securityTokenRepository.markTokenUsed(record.token_id);

    await this.auditLogRepository.logAction({
      actorUserId: record.user_id,
      actionType: "UPDATE",
      targetTable: "users",
      recordKey: String(record.user_id),
      postImageJson: { accountStatus: "ACTIVE" },
    });
  }

  /**
   * Resend Email Verification
   */
  public async resendEmailVerification(email: string): Promise<string | null> {
    const user = await this.userRepository.findByEmailWithDetails(email);
    if (!user || user.accountStatus === "ACTIVE") {
      return null;
    }

    const verificationRawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(verificationRawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.securityTokenRepository.createToken(
      user.userId,
      "EMAIL_VERIFICATION",
      tokenHash,
      expiresAt
    );

    return verificationRawToken;
  }

  /**
   * Initiate Forgot Password flow
   */
  public async forgotPassword(email: string): Promise<string | null> {
    const user = await this.userRepository.findByEmailWithDetails(email);
    if (!user) {
      return null;
    }

    const resetRawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetRawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.securityTokenRepository.createToken(
      user.userId,
      "PASSWORD_RESET",
      tokenHash,
      expiresAt
    );

    logger.info(`🔑 Issued Password Reset Token for user ${user.userId}`);
    return resetRawToken;
  }

  /**
   * Reset user password using token
   */
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = await this.securityTokenRepository.findValidToken(
      "PASSWORD_RESET",
      tokenHash
    );

    if (!record) {
      throw new BadRequestError("Invalid or expired password reset token.");
    }

    const newHashedPassword = await hashPassword(newPassword);
    await this.userRepository.updatePassword(record.user_id, newHashedPassword);
    await this.securityTokenRepository.markTokenUsed(record.token_id);

    await this.sessionRepository.revokeAllUserSessions(record.user_id);

    await this.auditLogRepository.logAction({
      actorUserId: record.user_id,
      actionType: "UPDATE",
      targetTable: "users",
      recordKey: String(record.user_id),
      postImageJson: { action: "PASSWORD_RESET" },
    });
  }

  /**
   * Change Password (for authenticated user)
   */
  public async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    const user = await this.userRepository.findByIdWithDetails(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Current password supplied is incorrect.");
    }

    const newHashedPassword = await hashPassword(newPassword);
    await this.userRepository.updatePassword(userId, newHashedPassword);
    await this.sessionRepository.revokeAllUserSessions(userId);

    await this.auditLogRepository.logAction({
      actorUserId: userId,
      actionType: "UPDATE",
      targetTable: "users",
      recordKey: String(userId),
      userAgent,
      ipAddress,
      postImageJson: { action: "PASSWORD_CHANGE" },
    });
  }

  /**
   * Verify Current Password
   */
  public async verifyPassword(userId: number, password: string): Promise<boolean> {
    const user = await this.userRepository.findByIdWithDetails(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }
    return comparePassword(password, user.passwordHash);
  }

  /**
   * Get Active Sessions for User
   */
  public async getUserSessions(userId: number): Promise<any[]> {
    return this.sessionRepository.getUserSessions(userId);
  }

  /**
   * Terminate Specific Session
   */
  public async terminateSession(userId: number, sessionId: number): Promise<void> {
    await this.sessionRepository.revokeSessionById(sessionId, userId);
    await this.auditLogRepository.logAction({
      actorUserId: userId,
      actionType: "UPDATE",
      targetTable: "user_sessions",
      recordKey: String(sessionId),
      postImageJson: { action: "SESSION_REVOKED" },
    });
  }
}
