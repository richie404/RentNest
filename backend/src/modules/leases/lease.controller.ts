import { Request, Response } from "express";
import { LeaseService } from "./lease.service";
import { ApiResponse } from "../../utils/response-formatter";

export class LeaseController {
  constructor(private leaseService: LeaseService) {}

  public bookProperty = async (req: Request, res: Response): Promise<Response> => {
    const tenantUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.leaseService.bookProperty(
      tenantUserId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.created(res, result, "Property booking request executed successfully.");
  };

  public submitApplication = async (req: Request, res: Response): Promise<Response> => {
    const applicantUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.leaseService.submitApplication(
      applicantUserId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.created(res, result, "Rental application submitted successfully.");
  };

  public updateApplicationStatus = async (req: Request, res: Response): Promise<Response> => {
    const applicationId = parseInt(req.params.id, 10);
    const requestorUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const updated = await this.leaseService.updateApplicationStatus(
      applicationId,
      requestorUserId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, updated, "Rental application status updated successfully.");
  };

  public getApplicationById = async (req: Request, res: Response): Promise<Response> => {
    const applicationId = parseInt(req.params.id, 10);
    const application = await this.leaseService.getApplicationById(applicationId);
    return ApiResponse.success(res, application, "Rental application retrieved successfully.");
  };

  public listApplications = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const isOwner = req.user!.roleName === "ROLE_PROPERTY_OWNER";
    const applications = await this.leaseService.listUserApplications(userId, isOwner);
    return ApiResponse.success(res, applications, "Rental applications retrieved successfully.");
  };

  public getLeaseById = async (req: Request, res: Response): Promise<Response> => {
    const leaseId = parseInt(req.params.id, 10);
    const lease = await this.leaseService.getLeaseById(leaseId);
    return ApiResponse.success(res, lease, "Lease details retrieved successfully.");
  };

  public listLeases = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const leases = await this.leaseService.listUserLeases(userId);
    return ApiResponse.success(res, leases, "User leases retrieved successfully.");
  };

  public signLease = async (req: Request, res: Response): Promise<Response> => {
    const leaseId = parseInt(req.params.id, 10);
    const userId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const updatedLease = await this.leaseService.signLease(
      leaseId,
      userId,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, updatedLease, "Lease document electronically signed successfully.");
  };

  public terminateLease = async (req: Request, res: Response): Promise<Response> => {
    const leaseId = parseInt(req.params.id, 10);
    const requestorUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.leaseService.terminateLease(
      leaseId,
      requestorUserId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, result, "Lease agreement terminated successfully.");
  };
}
