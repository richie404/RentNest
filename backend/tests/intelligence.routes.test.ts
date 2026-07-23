import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt.util";
import { IntelligenceRepository } from "../src/repositories/intelligence.repository";

const app = createApp();

describe("AI Intelligence Layer Integration Tests", () => {
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
  });

  describe("GET /api/v1/intelligence/search", () => {
    it("should perform semantic property search", async () => {
      vi.spyOn(IntelligenceRepository.prototype, "semanticSearchProperties").mockResolvedValueOnce([
        {
          propertyId: 1,
          propertyName: "Luxury Highrise",
          city: "Austin",
          baseMonthlyRent: 2500,
          relevanceScore: 0.95,
        },
      ]);

      const response = await request(app).get("/api/v1/intelligence/search?q=Austin luxury highrise");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe("POST /api/v1/intelligence/sentiment", () => {
    it("should analyze review sentiment via AIService provider interface", async () => {
      const response = await request(app)
        .post("/api/v1/intelligence/sentiment")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          reviewText: "The apartment complex is incredibly quiet, well maintained, and modern!",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sentiment).toBe("POSITIVE");
    });
  });

  describe("POST /api/v1/intelligence/categorize-maintenance", () => {
    it("should auto-categorize repair ticket description", async () => {
      const response = await request(app)
        .post("/api/v1/intelligence/categorize-maintenance")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          issueDescription: "Water leaking constantly under the kitchen sink.",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe("PLUMBING");
    });
  });

  describe("GET /api/v1/intelligence/fraud-risk/:id", () => {
    it("should evaluate applicant fraud risk flags for landlord/admin role", async () => {
      vi.spyOn(IntelligenceRepository.prototype, "getFraudRiskFlags").mockResolvedValueOnce({
        applicationId: 50,
        applicantUserId: 20,
        declaredIncome: 5000.0,
        riskFlag: "LOW_RISK",
      });

      const response = await request(app)
        .get("/api/v1/intelligence/fraud-risk/50")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.riskFlag).toBe("LOW_RISK");
    });
  });
});
