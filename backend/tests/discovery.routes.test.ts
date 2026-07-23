import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { DiscoveryRepository } from "../src/repositories/discovery.repository";

const app = createApp();

describe("Discovery & Engagement Routes Integration Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/v1/discovery/search", () => {
    it("should perform advanced search and return paginated results", async () => {
      vi.spyOn(DiscoveryRepository.prototype, "advancedSearch").mockResolvedValueOnce({
        data: [
          {
            unit_id: 1,
            unit_number: "101",
            bedrooms: 2,
            bathrooms: 2,
            target_rent: "1500.00",
            property_id: 10,
            property_name: "Grand View Apartments",
            city: "Austin",
            state_province: "TX",
            average_rating_score: 4.8,
            total_reviews_count: 12,
          },
        ],
        total: 1,
      });

      const response = await request(app)
        .get("/api/v1/discovery/search")
        .query({ city: "Austin", minRent: 1000, maxRent: 2000, sortBy: "rent_asc" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].property_name).toBe("Grand View Apartments");
      expect(response.body.meta.total).toBe(1);
    });
  });

  describe("GET /api/v1/discovery/recommendations", () => {
    it("should return recommended properties", async () => {
      vi.spyOn(DiscoveryRepository.prototype, "getRecommendations").mockResolvedValueOnce([
        {
          unit_id: 2,
          property_name: "Austin Heights",
          target_rent: "1800.00",
          average_rating_score: 5.0,
        },
      ]);

      const response = await request(app)
        .get("/api/v1/discovery/recommendations")
        .query({ limit: 5, city: "Austin" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].property_name).toBe("Austin Heights");
    });
  });

  describe("POST /api/v1/discovery/compare", () => {
    it("should return side-by-side comparison for requested property IDs", async () => {
      vi.spyOn(DiscoveryRepository.prototype, "compareProperties").mockResolvedValueOnce([
        {
          propertyId: 10,
          propertyName: "Grand View Apartments",
          city: "Austin",
          minRent: 1500,
          maxRent: 2000,
          averageRating: 4.8,
        },
        {
          propertyId: 11,
          propertyName: "Austin Heights",
          city: "Austin",
          minRent: 1800,
          maxRent: 2400,
          averageRating: 5.0,
        },
      ]);

      const response = await request(app)
        .post("/api/v1/discovery/compare")
        .send({ propertyIds: [10, 11] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].propertyName).toBe("Grand View Apartments");
    });

    it("should fail validation if propertyIds array is empty", async () => {
      const response = await request(app)
        .post("/api/v1/discovery/compare")
        .send({ propertyIds: [] });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/discovery/suggestions", () => {
    it("should return auto-complete suggestions", async () => {
      vi.spyOn(DiscoveryRepository.prototype, "getSearchSuggestions").mockResolvedValueOnce({
        cities: ["Austin", "Austinville"],
        properties: ["Austin Heights"],
      });

      const response = await request(app)
        .get("/api/v1/discovery/suggestions")
        .query({ q: "Aust" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cities).toContain("Austin");
    });
  });
});
