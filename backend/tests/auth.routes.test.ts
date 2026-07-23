import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt.util";

const app = createApp();

describe("Auth Routes HTTP Integration Tests", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should fail validation if email is invalid", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "not-an-email",
          password: "Pass",
          roleName: "ROLE_TENANT",
          firstName: "John",
          lastName: "Doe",
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should fail validation if password is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "user@example.com",
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return 401 Unauthorized when no token is provided", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 200 OK with user profile when valid Bearer token is sent", async () => {
      const mockToken = generateAccessToken({
        userId: 99,
        email: "authed@rentnest.com",
        roleId: 1,
        roleName: "ROLE_ADMIN",
        permissions: ["admin:all"],
      });

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("authed@rentnest.com");
      expect(res.body.data.user.roleName).toBe("ROLE_ADMIN");
    });
  });
});
