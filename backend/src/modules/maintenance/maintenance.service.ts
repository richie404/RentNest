import { MaintenanceRepository } from "../../repositories/maintenance.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import {
  CreateMaintenanceRequestDTO,
  AssignVendorDTO,
  UpdateMaintenanceStatusDTO,
} from "./maintenance.types";
import { NotFoundError, BadRequestError } from "../../utils/app-error";
import { withTransaction } from "../../utils/transaction.util";

export class MaintenanceService {
  constructor(
    private maintenanceRepository: MaintenanceRepository,
    private auditLogRepository: AuditLogRepository
  ) {}

  public async createRequest(
    reporterUserId: number,
    dto: CreateMaintenanceRequestDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ requestId: number }> {
    return await withTransaction(async (connection) => {
      const requestId = await this.maintenanceRepository.createRequest(
        reporterUserId,
        dto,
        connection
      );

      await this.auditLogRepository.logAction(
        {
          actorUserId: reporterUserId,
          actionType: "INSERT",
          targetTable: "maintenance_requests",
          recordKey: String(requestId),
          userAgent,
          ipAddress,
          postImageJson: { dto, requestId },
        },
        connection
      );

      return { requestId };
    });
  }

  public async assignVendor(
    requestId: number,
    managerUserId: number,
    dto: AssignVendorDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ statusMessage: string }> {
    const existing = await this.maintenanceRepository.findRequestById(requestId);
    if (!existing) {
      throw new NotFoundError(`Maintenance request with ID ${requestId} does not exist.`);
    }

    return await withTransaction(async (connection) => {
      const statusMessage = await this.maintenanceRepository.assignVendor(
        requestId,
        dto.vendorId,
        managerUserId,
        connection
      );

      if (statusMessage.startsWith("ERROR:")) {
        throw new BadRequestError(statusMessage);
      }

      await this.auditLogRepository.logAction(
        {
          actorUserId: managerUserId,
          actionType: "UPDATE",
          targetTable: "maintenance_requests",
          recordKey: String(requestId),
          userAgent,
          ipAddress,
          preImageJson: { status: existing.status, vendorId: existing.assignedVendorId },
          postImageJson: { status: "ASSIGNED", vendorId: dto.vendorId },
        },
        connection
      );

      return { statusMessage };
    });
  }

  public async updateStatus(
    requestId: number,
    userId: number,
    dto: UpdateMaintenanceStatusDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<any> {
    const existing = await this.maintenanceRepository.findRequestById(requestId);
    if (!existing) {
      throw new NotFoundError(`Maintenance request with ID ${requestId} does not exist.`);
    }

    return await withTransaction(async (connection) => {
      await this.maintenanceRepository.updateStatus(
        requestId,
        userId,
        dto.status,
        dto.note,
        connection
      );

      await this.auditLogRepository.logAction(
        {
          actorUserId: userId,
          actionType: "UPDATE",
          targetTable: "maintenance_requests",
          recordKey: String(requestId),
          userAgent,
          ipAddress,
          preImageJson: { status: existing.status },
          postImageJson: { status: dto.status, note: dto.note },
        },
        connection
      );

      return await this.maintenanceRepository.findRequestById(requestId, connection);
    });
  }

  public async getRequestById(requestId: number): Promise<any> {
    const request = await this.maintenanceRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError(`Maintenance request with ID ${requestId} does not exist.`);
    }
    return request;
  }

  public async listRequests(userId: number, roleName: string): Promise<any[]> {
    return this.maintenanceRepository.listRequests(userId, roleName);
  }

  public async getDispatchSummary(): Promise<any[]> {
    return this.maintenanceRepository.getDispatchSummary();
  }
}
