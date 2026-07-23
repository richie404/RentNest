import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt.util";
import { AnalyticsRepository } from "../src/repositories/analytics.repository";

const app = createApp();

describe("Analytics Engine & Reporting Integration Tests", () => {
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

  describe("GET /api/v1/analytics/executive-summary", () => {
    it("should return executive KPI summary for admin role", async () => {
      vi.spyOn(AnalyticsRepository.prototype, "getAdminExecutiveSummary").mockResolvedValueOnce({
        totalProperties: 10,
        totalUnits: 50,
        vacantUnits: 5,
        activeLeases: 45,
        totalUsers: 100,
        totalGrossRevenueSettled: 150000.0,
        openMaintenanceTickets: 2,
      });

      const response = await request(app)
        .get("/api/v1/analytics/executive-summary")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalUnits).toBe(50);
    });

    it("should reject access for tenant role with 403 Forbidden", async () => {
      const response = await request(app)
        .get("/api/v1/analytics/executive-summary")
        .set("Authorization", `Bearer ${tenantToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/analytics/occupancy", () => {
    it("should return occupancy percentage metrics", async () => {
      vi.spyOn(AnalyticsRepository.prototype, "getOccupancyAnalytics").mockResolvedValueOnce({
        totalUnits: 100,
        occupiedUnits: 90,
        vacantUnits: 10,
        occupancyRatePercentage: 90.0,
      });

      const response = await request(app)
        .get("/api/v1/analytics/occupancy")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.occupancyRatePercentage).toBe(90.0);
    });
  });

  describe("GET /api/v1/analytics/export", () => {
    it("should export report data in specified format", async () => {
      const response = await request(app)
        .get("/api/v1/analytics/export?format=CSV&reportType=REVENUE")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.format).toBe("CSV");
      expect(response.body.data.downloadUrl).toContain("csv");
    });
  });
});
