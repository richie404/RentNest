import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { ApiResponse } from "../../utils/response-formatter";

export class AdminController {
  constructor(private adminService: AdminService) {}

  public impersonateUser = async (req: Request, res: Response): Promise<Response> => {
    const adminUserId = req.user!.userId;
    const { targetUserId } = req.body;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.adminService.impersonateUser(
      adminUserId,
      targetUserId,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, result, "User session impersonated successfully.");
  };

  public getAuditLogs = async (req: Request, res: Response): Promise<Response> => {
    const targetTable = req.query.targetTable as string;
    const actionType = req.query.actionType as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const logs = await this.adminService.getAuditLogs(targetTable, actionType, limit, offset);
    return ApiResponse.success(res, logs, "Audit logs retrieved successfully.");
  };

  public globalSearch = async (req: Request, res: Response): Promise<Response> => {
    const q = req.query.q as string;
    const results = await this.adminService.globalSearch(q);
    return ApiResponse.success(res, results, "Global admin search completed successfully.");
  };

  public getSecurityDashboardMetrics = async (_req: Request, res: Response): Promise<Response> => {
    const metrics = await this.adminService.getSecurityDashboardMetrics();
    return ApiResponse.success(res, metrics, "Security dashboard metrics retrieved successfully.");
  };
}
