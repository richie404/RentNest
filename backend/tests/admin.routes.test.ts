import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt.util";
import { AdminRepository } from "../src/repositories/admin.repository";
import { UserRepository } from "../src/repositories/user.repository";
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

describe("Enterprise Administration Platform Integration Tests", () => {
  const adminToken = generateAccessToken({
    userId: 1,
    email: "admin@rentnest.com",
    roleId: 4,
    roleName: "ROLE_ADMIN",
    permissions: ["*"],
  });

  const tenantToken = generateAccessToken({
    userId: 20,
    email: "tenant@rentnest.com",
    roleId: 1,
    roleName: "ROLE_TENANT",
    permissions: [],
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuditLogRepository.prototype, "logAction").mockResolvedValue();
  });

  describe("POST /api/v1/admin/impersonate", () => {
    it("should allow admin to generate impersonation token for target user", async () => {
      vi.spyOn(UserRepository.prototype, "findByIdWithDetails").mockResolvedValueOnce({
        userId: 20,
        email: "tenant@rentnest.com",
        roleId: 1,
        roleName: "ROLE_TENANT",
        permissions: [],
      } as any);

      const response = await request(app)
        .post("/api/v1/admin/impersonate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ targetUserId: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.impersonationToken).toBeDefined();
    });

    it("should reject user impersonation by non-admin with 403 Forbidden", async () => {
      const response = await request(app)
        .post("/api/v1/admin/impersonate")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({ targetUserId: 1 });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/admin/audit-logs", () => {
    it("should return audit logs for admin role", async () => {
      vi.spyOn(AdminRepository.prototype, "getAuditLogs").mockResolvedValueOnce([
        {
          auditId: 1,
          actorUserId: 1,
          actionType: "INSERT",
          targetTable: "users",
          recordKey: "20",
          ipAddress: "127.0.0.1",
          createdAt: new Date().toISOString(),
          actorEmail: "admin@rentnest.com",
        },
      ]);

      const response = await request(app)
        .get("/api/v1/admin/audit-logs")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe("GET /api/v1/admin/security-dashboard", () => {
    it("should return security overview metrics", async () => {
      vi.spyOn(AdminRepository.prototype, "getSecurityDashboardMetrics").mockResolvedValueOnce({
        activeSessionsCount: 42,
        auditEvents24h: 150,
        suspendedUsersCount: 2,
      });

      const response = await request(app)
        .get("/api/v1/admin/security-dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activeSessionsCount).toBe(42);
    });
  });
});
