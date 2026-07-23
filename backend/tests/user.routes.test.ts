import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt.util";

const app = createApp();

describe("User & RBAC Routes HTTP Integration Tests", () => {
  const adminToken = generateAccessToken({
    userId: 1,
    email: "admin@rentnest.com",
    roleId: 5,
    roleName: "ROLE_ADMIN",
    permissions: ["user:manage", "rbac:manage"],
  });

  const tenantToken = generateAccessToken({
    userId: 2,
    email: "tenant@rentnest.com",
    roleId: 1,
    roleName: "ROLE_TENANT",
    permissions: [],
  });

  describe("GET /api/v1/users", () => {
    it("should return 403 Forbidden for non-admin users", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${tenantToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/rbac/roles", () => {
    it("should return 401 Unauthorized if request has no Bearer token", async () => {
      const res = await request(app).get("/api/v1/rbac/roles");
      expect(res.status).toBe(401);
    });

    it("should return 403 Forbidden for tenant trying to view roles", async () => {
      const res = await request(app)
        .get("/api/v1/rbac/roles")
        .set("Authorization", `Bearer ${tenantToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/v1/users/:id/status", () => {
    it("should reject status update with invalid status enum", async () => {
      const res = await request(app)
        .patch("/api/v1/users/2/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "INVALID_STATUS" });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });
});
