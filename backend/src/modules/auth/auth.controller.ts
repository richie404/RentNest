import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../utils/response-formatter";
import { jwtConfig } from "../../config/jwt.config";
import { env } from "../../config/env.config";

export class AuthController {
  constructor(private authService: AuthService) {}

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie(jwtConfig.cookieName, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(jwtConfig.cookieName, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }

  public register = async (req: Request, res: Response): Promise<Response> => {
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.authService.register(req.body, userAgent, ipAddress);

    return ApiResponse.created(
      res,
      {
        userId: result.userId,
        verificationToken: env.NODE_ENV === "development" ? result.verificationToken : undefined,
      },
      "User registered successfully. Please verify your email."
    );
  };

  public login = async (req: Request, res: Response): Promise<Response> => {
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const { authData, refreshToken } = await this.authService.login(
      req.body,
      userAgent,
      ipAddress
    );

    this.setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(res, authData, "Login successful.");
  };

  public logout = async (req: Request, res: Response): Promise<Response> => {
    const refreshToken = req.cookies[jwtConfig.cookieName];
    const userId = req.user?.userId;

    await this.authService.logout(refreshToken, userId);
    this.clearRefreshTokenCookie(res);

    return ApiResponse.success(res, null, "Logged out successfully.");
  };

  public refreshTokens = async (req: Request, res: Response): Promise<Response> => {
    const refreshToken = req.cookies[jwtConfig.cookieName] || req.body.refreshToken;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const { authData, newRefreshToken } = await this.authService.refreshTokens(
      refreshToken,
      userAgent,
      ipAddress
    );

    this.setRefreshTokenCookie(res, newRefreshToken);

    return ApiResponse.success(res, authData, "Tokens refreshed successfully.");
  };

  public verifyEmail = async (req: Request, res: Response): Promise<Response> => {
    const token = req.body.token || (req.query.token as string);
    await this.authService.verifyEmail(token);

    return ApiResponse.success(res, null, "Email address verified successfully.");
  };

  public resendVerification = async (req: Request, res: Response): Promise<Response> => {
    const token = await this.authService.resendEmailVerification(req.body.email);
    return ApiResponse.success(
      res,
      { verificationToken: env.NODE_ENV === "development" ? token : undefined },
      "Verification email dispatched if account is pending verification."
    );
  };

  public forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    const resetToken = await this.authService.forgotPassword(req.body.email);

    return ApiResponse.success(
      res,
      {
        resetToken: env.NODE_ENV === "development" ? resetToken : undefined,
      },
      "If the email exists in our system, a reset link has been dispatched."
    );
  };

  public resetPassword = async (req: Request, res: Response): Promise<Response> => {
    await this.authService.resetPassword(req.body.token, req.body.newPassword);

    return ApiResponse.success(res, null, "Password reset successfully. Please log in.");
  };

  public changePassword = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    await this.authService.changePassword(
      userId,
      req.body.currentPassword,
      req.body.newPassword,
      userAgent,
      ipAddress
    );

    this.clearRefreshTokenCookie(res);
    return ApiResponse.success(res, null, "Password changed successfully. Please log in with your new password.");
  };

  public verifyPassword = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const isValid = await this.authService.verifyPassword(userId, req.body.password);
    return ApiResponse.success(res, { isValid }, "Current password verification evaluation.");
  };

  public getUserSessions = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const sessions = await this.authService.getUserSessions(userId);
    return ApiResponse.success(res, sessions, "User active sessions retrieved successfully.");
  };

  public terminateSession = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const sessionId = parseInt(req.params.sessionId as string, 10);

    await this.authService.terminateSession(userId, sessionId);
    return ApiResponse.success(res, null, "Session terminated successfully.");
  };

  public getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
    return ApiResponse.success(res, { user: req.user }, "Current authenticated user profile.");
  };
}
