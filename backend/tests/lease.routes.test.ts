import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt.util";
import { LeaseRepository } from "../src/repositories/lease.repository";
import { AuditLogRepository } from "../src/repositories/audit-log.repository";

vi.mock("../src/utils/transaction.util", () => ({
  withTransaction: vi.fn((cb) =>
    cb({
      execute: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      query: vi.fn().mockResolvedValue([[]]),
    })
  ),
}));

const app = createApp();

describe("Lease & Booking Routes Integration Tests", () => {
  const tenantToken = generateAccessToken({
    userId: 20,
    email: "tenant@rentnest.com",
    roleId: 1,
    roleName: "ROLE_TENANT",
    permissions: [],
  });

  const ownerToken = generateAccessToken({
    userId: 10,
    email: "owner@rentnest.com",
    roleId: 2,
    roleName: "ROLE_PROPERTY_OWNER",
    permissions: ["lease:manage"],
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuditLogRepository.prototype, "logAction").mockResolvedValue();
  });

  describe("POST /api/v1/leases/bookings", () => {
    it("should execute booking request successfully", async () => {
      vi.spyOn(LeaseRepository.prototype, "bookProperty").mockResolvedValueOnce({
        leaseId: 101,
        statusMessage: "SUCCESS: Lease executed and unit occupied.",
      });

      const response = await request(app)
        .post("/api/v1/leases/bookings")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          unitId: 1,
          startDate: "2026-08-01",
          endDate: "2027-08-01",
          monthlyRent: 1500,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.leaseId).toBe(101);
    });

    it("should fail validation if startDate format is invalid", async () => {
      const response = await request(app)
        .post("/api/v1/leases/bookings")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          unitId: 1,
          startDate: "08-01-2026", // Invalid format
          endDate: "2027-08-01",
          monthlyRent: 1500,
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/leases/applications", () => {
    it("should submit rental application successfully", async () => {
      vi.spyOn(LeaseRepository.prototype, "submitApplication").mockResolvedValueOnce(50);

      const response = await request(app)
        .post("/api/v1/leases/applications")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          unitId: 1,
          desiredMoveInDate: "2026-08-15",
          proposedLeaseMonths: 12,
          declaredOccupantsCount: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.applicationId).toBe(50);
    });
  });

  describe("PATCH /api/v1/leases/applications/:id/status", () => {
    it("should allow property owner to approve rental application", async () => {
      vi.spyOn(LeaseRepository.prototype, "findApplicationById")
        .mockResolvedValueOnce({
          applicationId: 50,
          status: "SUBMITTED",
        })
        .mockResolvedValueOnce({
          applicationId: 50,
          status: "APPROVED",
        });

      vi.spyOn(LeaseRepository.prototype, "updateApplicationStatus").mockResolvedValueOnce();

      const response = await request(app)
        .patch("/api/v1/leases/applications/50/status")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: "APPROVED" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("APPROVED");
    });
  });

  describe("POST /api/v1/leases/:id/terminate", () => {
    it("should allow owner to terminate lease agreement", async () => {
      vi.spyOn(LeaseRepository.prototype, "findLeaseById").mockResolvedValueOnce({
        leaseId: 101,
        status: "ACTIVE",
      });

      vi.spyOn(LeaseRepository.prototype, "cancelLease").mockResolvedValueOnce(
        "SUCCESS: Lease terminated and unit restored to VACANT status."
      );

      const response = await request(app)
        .post("/api/v1/leases/101/terminate")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ reason: "Early termination agreed by parties." });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.statusMessage).toContain("SUCCESS:");
    });
  });
});
