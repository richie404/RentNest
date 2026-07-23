import { describe, it, expect, vi, beforeEach } from "vitest";
import { PropertyService } from "../src/modules/properties/property.service";
import { PropertyRepository } from "../src/repositories/property.repository";
import { AuditLogRepository } from "../src/repositories/audit-log.repository";
import { NotFoundError, ForbiddenError, BadRequestError } from "../src/utils/app-error";

vi.mock("../src/utils/transaction.util", () => ({
  withTransaction: vi.fn((cb) => cb({})),
}));

describe("PropertyService Unit Tests", () => {
  let propertyService: PropertyService;
  let mockPropertyRepository: any;
  let mockAuditLogRepository: any;

  beforeEach(() => {
    mockPropertyRepository = {
      createProperty: vi.fn(),
      approveProperty: vi.fn(),
      findPropertyById: vi.fn(),
      searchProperties: vi.fn(),
      updateProperty: vi.fn(),
      deleteProperty: vi.fn(),
      createUnit: vi.fn(),
      updateUnit: vi.fn(),
      addMedia: vi.fn(),
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      getUserFavorites: vi.fn(),
      submitReview: vi.fn(),
      getPropertyReviews: vi.fn(),
    };

    mockAuditLogRepository = {
      logAction: vi.fn(),
    };

    propertyService = new PropertyService(
      mockPropertyRepository as PropertyRepository,
      mockAuditLogRepository as AuditLogRepository
    );
  });

  describe("createProperty", () => {
    it("should call sp_CreateProperty via repo and log audit", async () => {
      mockPropertyRepository.createProperty.mockResolvedValue({
        propertyId: 10,
        unitId: 20,
        statusMessage: "SUCCESS: Property initialized",
      });

      const res = await propertyService.createProperty(1, {
        propertyName: "Grand Horizon",
        propertyType: "APARTMENT",
        streetAddress: "123 Main St",
        city: "Austin",
        stateProvince: "TX",
        postalCode: "78701",
        unitNumber: "101",
        bedrooms: 2,
        bathrooms: 2,
        targetRent: 2200,
        deposit: 2200,
      });

      expect(res.propertyId).toBe(10);
      expect(res.unitId).toBe(20);
      expect(mockAuditLogRepository.logAction).toHaveBeenCalled();
    });

    it("should throw BadRequestError if procedure returns failure message", async () => {
      mockPropertyRepository.createProperty.mockResolvedValue({
        propertyId: 0,
        unitId: 0,
        statusMessage: "ERROR: Property creation failed.",
      });

      await expect(
        propertyService.createProperty(1, {
          propertyName: "Fail Building",
          propertyType: "CONDO",
          streetAddress: "000 Fail",
          city: "Austin",
          stateProvince: "TX",
          postalCode: "78701",
          unitNumber: "1",
          bedrooms: 1,
          bathrooms: 1,
          targetRent: 1000,
          deposit: 1000,
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("updateProperty", () => {
    it("should throw ForbiddenError if non-owner and non-admin attempts update", async () => {
      mockPropertyRepository.findPropertyById.mockResolvedValue({ propertyId: 1, ownerId: 99 });

      await expect(
        propertyService.updateProperty(1, 5, "ROLE_PROPERTY_OWNER", { propertyName: "Hacked" })
      ).rejects.toThrow(ForbiddenError);
    });

    it("should update property successfully if user is owner", async () => {
      mockPropertyRepository.findPropertyById.mockResolvedValue({ propertyId: 1, ownerId: 5, propertyName: "Old" });

      await propertyService.updateProperty(1, 5, "ROLE_PROPERTY_OWNER", { propertyName: "Updated Name" });

      expect(mockPropertyRepository.updateProperty).toHaveBeenCalledWith(1, { propertyName: "Updated Name" }, expect.anything());
      expect(mockAuditLogRepository.logAction).toHaveBeenCalled();
    });
  });

  describe("approveProperty", () => {
    it("should invoke sp_ApproveProperty and log override audit entry", async () => {
      mockPropertyRepository.findPropertyById.mockResolvedValue({ propertyId: 5 });
      mockPropertyRepository.approveProperty.mockResolvedValue("SUCCESS: Property approved");

      const msg = await propertyService.approveProperty(5, 1);

      expect(msg).toContain("SUCCESS");
      expect(mockAuditLogRepository.logAction).toHaveBeenCalled();
    });
  });
});
