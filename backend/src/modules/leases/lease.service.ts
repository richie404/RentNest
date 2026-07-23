import { LeaseRepository } from "../../repositories/lease.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import {
  CreateBookingDTO,
  CreateApplicationDTO,
  UpdateApplicationStatusDTO,
  TerminateLeaseDTO,
} from "./lease.types";
import { NotFoundError, BadRequestError, ForbiddenError } from "../../utils/app-error";
import { withTransaction } from "../../utils/transaction.util";

export class LeaseService {
  constructor(
    private leaseRepository: LeaseRepository,
    private auditLogRepository: AuditLogRepository
  ) {}

  public async bookProperty(
    tenantUserId: number,
    dto: CreateBookingDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ leaseId: number; statusMessage: string }> {
    return await withTransaction(async (connection) => {
      const result = await this.leaseRepository.bookProperty(tenantUserId, dto, connection);

      if (result.statusMessage.startsWith("ERROR:")) {
        throw new BadRequestError(result.statusMessage);
      }

      await this.auditLogRepository.logAction(
        {
          actorUserId: tenantUserId,
          actionType: "INSERT",
          targetTable: "leases",
          recordKey: String(result.leaseId),
          userAgent,
          ipAddress,
          postImageJson: { dto, leaseId: result.leaseId },
        },
        connection
      );

      return result;
    });
  }

  public async submitApplication(
    applicantUserId: number,
    dto: CreateApplicationDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ applicationId: number }> {
    return await withTransaction(async (connection) => {
      const applicationId = await this.leaseRepository.submitApplication(
        applicantUserId,
        dto,
        connection
      );

      await this.auditLogRepository.logAction(
        {
          actorUserId: applicantUserId,
          actionType: "INSERT",
          targetTable: "rental_applications",
          recordKey: String(applicationId),
          userAgent,
          ipAddress,
          postImageJson: { dto, applicationId },
        },
        connection
      );

      return { applicationId };
    });
  }

  public async updateApplicationStatus(
    applicationId: number,
    requestorUserId: number,
    dto: UpdateApplicationStatusDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<any> {
    const existing = await this.leaseRepository.findApplicationById(applicationId);
    if (!existing) {
      throw new NotFoundError(`Rental application with ID ${applicationId} does not exist.`);
    }

    return await withTransaction(async (connection) => {
      await this.leaseRepository.updateApplicationStatus(applicationId, dto.status, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: requestorUserId,
          actionType: "UPDATE",
          targetTable: "rental_applications",
          recordKey: String(applicationId),
          userAgent,
          ipAddress,
          preImageJson: { status: existing.status },
          postImageJson: { status: dto.status },
        },
        connection
      );

      return await this.leaseRepository.findApplicationById(applicationId, connection);
    });
  }

  public async getApplicationById(applicationId: number): Promise<any> {
    const application = await this.leaseRepository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundError(`Rental application with ID ${applicationId} does not exist.`);
    }
    return application;
  }

  public async listUserApplications(userId: number, isOwner: boolean = false): Promise<any[]> {
    return this.leaseRepository.listApplications(userId, isOwner);
  }

  public async getLeaseById(leaseId: number): Promise<any> {
    const lease = await this.leaseRepository.findLeaseById(leaseId);
    if (!lease) {
      throw new NotFoundError(`Lease with ID ${leaseId} does not exist.`);
    }
    return lease;
  }

  public async listUserLeases(userId: number): Promise<any[]> {
    return this.leaseRepository.listUserLeases(userId);
  }

  public async signLease(
    leaseId: number,
    userId: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<any> {
    const lease = await this.leaseRepository.findLeaseById(leaseId);
    if (!lease) {
      throw new NotFoundError(`Lease with ID ${leaseId} does not exist.`);
    }

    return await withTransaction(async (connection) => {
      await this.leaseRepository.signLease(leaseId, userId, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: userId,
          actionType: "UPDATE",
          targetTable: "lease_signers",
          recordKey: String(leaseId),
          userAgent,
          ipAddress,
          postImageJson: { signedAt: new Date().toISOString() },
        },
        connection
      );

      return await this.leaseRepository.findLeaseById(leaseId, connection);
    });
  }

  public async terminateLease(
    leaseId: number,
    requestorUserId: number,
    dto: TerminateLeaseDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ statusMessage: string }> {
    const lease = await this.leaseRepository.findLeaseById(leaseId);
    if (!lease) {
      throw new NotFoundError(`Lease with ID ${leaseId} does not exist.`);
    }

    return await withTransaction(async (connection) => {
      const statusMessage = await this.leaseRepository.cancelLease(
        leaseId,
        dto.reason,
        connection
      );

      if (statusMessage.startsWith("ERROR:")) {
        throw new BadRequestError(statusMessage);
      }

      await this.auditLogRepository.logAction(
        {
          actorUserId: requestorUserId,
          actionType: "OVERRIDE",
          targetTable: "leases",
          recordKey: String(leaseId),
          userAgent,
          ipAddress,
          postImageJson: { reason: dto.reason, status: "TERMINATED" },
        },
        connection
      );

      return { statusMessage };
    });
  }
}
