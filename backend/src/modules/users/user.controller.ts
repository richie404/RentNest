import { Request, Response } from "express";
import { UserService } from "./user.service";
import { ApiResponse } from "../../utils/response-formatter";

export class UserController {
  constructor(private userService: UserService) {}

  public getUsers = async (req: Request, res: Response): Promise<Response> => {
    const { data, meta } = await this.userService.getUsers(req.query as any);
    return ApiResponse.paginated(res, data, meta, "User records retrieved successfully.");
  };

  public getUserById = async (req: Request, res: Response): Promise<Response> => {
    const userId = parseInt(req.params.id as string, 10);
    const user = await this.userService.getUserById(userId);
    return ApiResponse.success(res, user, "User record retrieved successfully.");
  };

  public updateProfile = async (req: Request, res: Response): Promise<Response> => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetUserId = parseInt(paramId, 10);
    const requestorUserId = req.user!.userId;
    const requestorRole = req.user!.roleName;
    const userAgent = Array.isArray(req.headers["user-agent"]) ? req.headers["user-agent"][0] : req.headers["user-agent"];
    const ipAddress = req.ip;

    const updatedUser = await this.userService.updateProfile(
      targetUserId,
      requestorUserId,
      requestorRole,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, updatedUser, "User profile updated successfully.");
  };

  public updateStatus = async (req: Request, res: Response): Promise<Response> => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetUserId = parseInt(paramId, 10);
    const adminUserId = req.user!.userId;
    const userAgent = Array.isArray(req.headers["user-agent"]) ? req.headers["user-agent"][0] : req.headers["user-agent"];
    const ipAddress = req.ip;

    const updatedUser = await this.userService.updateStatus(
      targetUserId,
      adminUserId,
      req.body.status,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, updatedUser, "User account status updated successfully.");
  };

  public adminResetPassword = async (req: Request, res: Response): Promise<Response> => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetUserId = parseInt(paramId, 10);
    const adminUserId = req.user!.userId;
    const userAgent = Array.isArray(req.headers["user-agent"]) ? req.headers["user-agent"][0] : req.headers["user-agent"];
    const ipAddress = req.ip;

    await this.userService.adminResetPassword(
      targetUserId,
      adminUserId,
      req.body.newPassword,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, null, "User password reset successfully by admin.");
  };

  public adminForceLogout = async (req: Request, res: Response): Promise<Response> => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetUserId = parseInt(paramId, 10);
    const adminUserId = req.user!.userId;
    const userAgent = Array.isArray(req.headers["user-agent"]) ? req.headers["user-agent"][0] : req.headers["user-agent"];
    const ipAddress = req.ip;

    await this.userService.adminForceLogout(
      targetUserId,
      adminUserId,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, null, "User sessions terminated by admin.");
  };

  public getAuditHistory = async (req: Request, res: Response): Promise<Response> => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetUserId = parseInt(paramId, 10);
    const logs = await this.userService.getUserAuditHistory(targetUserId);
    return ApiResponse.success(res, logs, "User audit log history retrieved successfully.");
  };
}
