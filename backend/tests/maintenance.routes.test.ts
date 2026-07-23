import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt.util";
import { MaintenanceRepository } from "../src/repositories/maintenance.repository";
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

describe("Maintenance & Vendor Operations Integration Tests", () => {
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
    permissions: ["maint:manage"],
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuditLogRepository.prototype, "logAction").mockResolvedValue();
  });

  describe("POST /api/v1/maintenance/requests", () => {
    it("should allow tenant to submit maintenance ticket", async () => {
      vi.spyOn(MaintenanceRepository.prototype, "createRequest").mockResolvedValueOnce(300);

      const response = await request(app)
        .post("/api/v1/maintenance/requests")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          unitId: 1,
          issueCategory: "PLUMBING",
          priorityLevel: "HIGH",
          permissionToEnter: true,
          description: "Water leaking heavily from bathroom sink pipe.",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.requestId).toBe(300);
    });

    it("should fail validation if description is too short", async () => {
      const response = await request(app)
        .post("/api/v1/maintenance/requests")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          unitId: 1,
          issueCategory: "PLUMBING",
          description: "Leaking", // < 10 characters
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/maintenance/requests/:id/assign", () => {
    it("should allow owner to assign maintenance request to vendor", async () => {
      vi.spyOn(MaintenanceRepository.prototype, "findRequestById").mockResolvedValueOnce({
        requestId: 300,
        status: "OPEN",
      });

      vi.spyOn(MaintenanceRepository.prototype, "assignVendor").mockResolvedValueOnce(
        "SUCCESS: Maintenance request assigned to vendor."
      );

      const response = await request(app)
        .post("/api/v1/maintenance/requests/300/assign")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ vendorId: 5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.statusMessage).toContain("SUCCESS:");
    });
  });

  describe("PATCH /api/v1/maintenance/requests/:id/status", () => {
    it("should update maintenance ticket status and record update note", async () => {
      vi.spyOn(MaintenanceRepository.prototype, "findRequestById")
        .mockResolvedValueOnce({
          requestId: 300,
          status: "OPEN",
        })
        .mockResolvedValueOnce({
          requestId: 300,
          status: "IN_PROGRESS",
        });

      vi.spyOn(MaintenanceRepository.prototype, "updateStatus").mockResolvedValueOnce();

      const response = await request(app)
        .patch("/api/v1/maintenance/requests/300/status")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: "IN_PROGRESS", note: "Technician arrived on site." });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("IN_PROGRESS");
    });
  });
});
