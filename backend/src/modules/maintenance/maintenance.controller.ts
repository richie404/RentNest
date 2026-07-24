import { Request, Response } from "express";
import { MaintenanceService } from "./maintenance.service";
import { ApiResponse } from "../../utils/response-formatter";

export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  public createRequest = async (req: Request, res: Response): Promise<Response> => {
    const reporterUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.maintenanceService.createRequest(
      reporterUserId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.created(res, result, "Maintenance ticket submitted successfully.");
  };

  public assignVendor = async (req: Request, res: Response): Promise<Response> => {
    const requestId = parseInt(req.params.id as string, 10);
    const managerUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.maintenanceService.assignVendor(
      requestId,
      managerUserId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, result, "Work order assigned to vendor successfully.");
  };

  public updateStatus = async (req: Request, res: Response): Promise<Response> => {
    const requestId = parseInt(req.params.id as string, 10);
    const userId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const updated = await this.maintenanceService.updateStatus(
      requestId,
      userId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, updated, "Maintenance ticket status updated successfully.");
  };

  public getRequestById = async (req: Request, res: Response): Promise<Response> => {
    const requestId = parseInt(req.params.id as string, 10);
    const request = await this.maintenanceService.getRequestById(requestId);
    return ApiResponse.success(res, request, "Maintenance ticket retrieved successfully.");
  };

  public listRequests = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const roleName = req.user!.roleName;
    const requests = await this.maintenanceService.listRequests(userId, roleName);
    return ApiResponse.success(res, requests, "Maintenance tickets retrieved successfully.");
  };

  public getDispatchSummary = async (_req: Request, res: Response): Promise<Response> => {
    const summary = await this.maintenanceService.getDispatchSummary();
    return ApiResponse.success(res, summary, "Maintenance dispatch summary retrieved successfully.");
  };
}
