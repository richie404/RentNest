import { PropertyRepository } from "../../repositories/property.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import {
  CreatePropertyDTO,
  UpdatePropertyDTO,
  CreateUnitDTO,
  UpdateUnitDTO,
  PropertyFilterOptions,
  SubmitReviewDTO,
} from "../../types/property.types";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../utils/app-error";
import { withTransaction } from "../../utils/transaction.util";

export class PropertyService {
  constructor(
    private propertyRepository: PropertyRepository,
    private auditLogRepository: AuditLogRepository
  ) {}

  public async createProperty(
    ownerId: number,
    dto: CreatePropertyDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ propertyId: number; unitId: number }> {
    return await withTransaction(async (connection) => {
      const { propertyId, unitId, statusMessage } = await this.propertyRepository.createProperty(
        ownerId,
        dto,
        connection
      );

      if (propertyId === 0 || statusMessage.startsWith("ERROR")) {
        throw new BadRequestError(statusMessage || "Property creation failed.");
      }

      await this.auditLogRepository.logAction(
        {
          actorUserId: ownerId,
          actionType: "INSERT",
          targetTable: "properties",
          recordKey: String(propertyId),
          userAgent,
          ipAddress,
          postImageJson: { propertyName: dto.propertyName, initialUnitId: unitId },
        },
        connection
      );

      return { propertyId, unitId };
    });
  }

  public async getPropertyById(propertyId: number): Promise<any> {
    const property = await this.propertyRepository.findPropertyById(propertyId);
    if (!property) {
      throw new NotFoundError(`Property with ID ${propertyId} does not exist.`);
    }
    return property;
  }

  public async searchProperties(options: PropertyFilterOptions): Promise<{ data: any[]; meta: any }> {
    const { data, total } = await this.propertyRepository.searchProperties(options);
    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  public async updateProperty(
    propertyId: number,
    requestorUserId: number,
    requestorRole: string,
    dto: UpdatePropertyDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<any> {
    const existing = await this.propertyRepository.findPropertyById(propertyId);
    if (!existing) {
      throw new NotFoundError(`Property with ID ${propertyId} does not exist.`);
    }

    if (existing.ownerId !== requestorUserId && requestorRole !== "ROLE_ADMIN") {
      throw new ForbiddenError("You are not authorized to update this property.");
    }

    return await withTransaction(async (connection) => {
      await this.propertyRepository.updateProperty(propertyId, dto, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: requestorUserId,
          actionType: "UPDATE",
          targetTable: "properties",
          recordKey: String(propertyId),
          userAgent,
          ipAddress,
          preImageJson: { propertyName: existing.propertyName },
          postImageJson: dto,
        },
        connection
      );

      return await this.propertyRepository.findPropertyById(propertyId, connection);
    });
  }

  public async deleteProperty(
    propertyId: number,
    requestorUserId: number,
    requestorRole: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    const existing = await this.propertyRepository.findPropertyById(propertyId);
    if (!existing) {
      throw new NotFoundError(`Property with ID ${propertyId} does not exist.`);
    }

    if (existing.ownerId !== requestorUserId && requestorRole !== "ROLE_ADMIN") {
      throw new ForbiddenError("You are not authorized to delete this property.");
    }

    await withTransaction(async (connection) => {
      await this.propertyRepository.deleteProperty(propertyId, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: requestorUserId,
          actionType: "DELETE",
          targetTable: "properties",
          recordKey: String(propertyId),
          userAgent,
          ipAddress,
          preImageJson: { propertyName: existing.propertyName },
        },
        connection
      );
    });
  }

  public async approveProperty(
    propertyId: number,
    adminUserId: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<string> {
    const existing = await this.propertyRepository.findPropertyById(propertyId);
    if (!existing) {
      throw new NotFoundError(`Property with ID ${propertyId} does not exist.`);
    }

    return await withTransaction(async (connection) => {
      const statusMessage = await this.propertyRepository.approveProperty(
        propertyId,
        adminUserId,
        connection
      );

      if (statusMessage.startsWith("ERROR")) {
        throw new BadRequestError(statusMessage);
      }

      await this.auditLogRepository.logAction(
        {
          actorUserId: adminUserId,
          actionType: "OVERRIDE",
          targetTable: "properties",
          recordKey: String(propertyId),
          userAgent,
          ipAddress,
          postImageJson: { approvalStatus: "APPROVED" },
        },
        connection
      );

      return statusMessage;
    });
  }

  public async addUnit(
    propertyId: number,
    requestorUserId: number,
    requestorRole: string,
    dto: CreateUnitDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<number> {
    const existing = await this.propertyRepository.findPropertyById(propertyId);
    if (!existing) {
      throw new NotFoundError(`Property with ID ${propertyId} does not exist.`);
    }

    if (existing.ownerId !== requestorUserId && requestorRole !== "ROLE_ADMIN") {
      throw new ForbiddenError("You are not authorized to manage units for this property.");
    }

    return await withTransaction(async (connection) => {
      const unitId = await this.propertyRepository.createUnit(propertyId, dto, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: requestorUserId,
          actionType: "INSERT",
          targetTable: "units",
          recordKey: String(unitId),
          userAgent,
          ipAddress,
          postImageJson: { propertyId, unitNumber: dto.unitNumber, rent: dto.targetRent },
        },
        connection
      );

      return unitId;
    });
  }

  public async updateUnit(
    unitId: number,
    requestorUserId: number,
    requestorRole: string,
    dto: UpdateUnitDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    await withTransaction(async (connection) => {
      await this.propertyRepository.updateUnit(unitId, dto, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: requestorUserId,
          actionType: "UPDATE",
          targetTable: "units",
          recordKey: String(unitId),
          userAgent,
          ipAddress,
          postImageJson: dto,
        },
        connection
      );
    });
  }

  public async addMedia(
    propertyId: number,
    requestorUserId: number,
    requestorRole: string,
    mediaUrl: string,
    mediaType: "IMAGE" | "VIDEO" | "DOCUMENT",
    unitId?: number,
    isPrimary?: boolean,
    caption?: string
  ): Promise<number> {
    const existing = await this.propertyRepository.findPropertyById(propertyId);
    if (!existing) {
      throw new NotFoundError(`Property with ID ${propertyId} does not exist.`);
    }

    if (existing.ownerId !== requestorUserId && requestorRole !== "ROLE_ADMIN") {
      throw new ForbiddenError("You are not authorized to add media to this property.");
    }

    return await this.propertyRepository.addMedia(
      propertyId,
      mediaUrl,
      mediaType,
      unitId,
      isPrimary,
      caption
    );
  }

  public async toggleFavorite(userId: number, unitId: number, action: "add" | "remove"): Promise<void> {
    if (action === "add") {
      await this.propertyRepository.addFavorite(userId, unitId);
    } else {
      await this.propertyRepository.removeFavorite(userId, unitId);
    }
  }

  public async getUserFavorites(userId: number): Promise<any[]> {
    return this.propertyRepository.getUserFavorites(userId);
  }

  public async submitReview(
    reviewerId: number,
    dto: SubmitReviewDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<string> {
    return await withTransaction(async (connection) => {
      const statusMessage = await this.propertyRepository.submitReview(
        reviewerId,
        dto,
        connection
      );

      if (statusMessage.startsWith("ERROR")) {
        throw new BadRequestError(statusMessage);
      }

      await this.auditLogRepository.logAction(
        {
          actorUserId: reviewerId,
          actionType: "INSERT",
          targetTable: "reviews",
          recordKey: String(dto.leaseId),
          userAgent,
          ipAddress,
          postImageJson: { rating: dto.rating, text: dto.reviewText },
        },
        connection
      );

      return statusMessage;
    });
  }

  public async getPropertyReviews(propertyId: number): Promise<any[]> {
    return this.propertyRepository.getPropertyReviews(propertyId);
  }
}
