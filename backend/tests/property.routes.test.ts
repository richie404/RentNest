import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt.util";
import { PropertyRepository } from "../src/repositories/property.repository";

const app = createApp();

describe("Property Routes HTTP Integration Tests", () => {
  const ownerToken = generateAccessToken({
    userId: 10,
    email: "owner@rentnest.com",
    roleId: 2,
    roleName: "ROLE_PROPERTY_OWNER",
    permissions: ["property:create", "property:update"],
  });

  const tenantToken = generateAccessToken({
    userId: 20,
    email: "tenant@rentnest.com",
    roleId: 1,
    roleName: "ROLE_TENANT",
    permissions: [],
  });

  describe("GET /api/v1/properties/search", () => {
    it("should accept valid search parameters", async () => {
      vi.spyOn(PropertyRepository.prototype, "searchProperties").mockResolvedValueOnce({
        data: [
          {
            unit_id: 1,
            unit_number: "101",
            bedrooms: 2,
            bathrooms: 2,
            target_rent: 1500,
            unit_status: "VACANT",
            property_id: 10,
            property_name: "Austin Heights",
            city: "Austin",
          },
        ],
        total: 1,
      });

      const res = await request(app).get("/api/v1/properties/search?city=Austin&minRent=1000");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe("POST /api/v1/properties", () => {
    it("should return 403 Forbidden if tenant attempts property creation", async () => {
      const res = await request(app)
        .post("/api/v1/properties")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          propertyName: "Tenant House",
          propertyType: "SINGLE_FAMILY",
          streetAddress: "123 Street",
          city: "Austin",
          stateProvince: "TX",
          postalCode: "78701",
          unitNumber: "A",
          bedrooms: 3,
          bathrooms: 2,
          targetRent: 2500,
          deposit: 2500,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should validate input schema for property creation", async () => {
      const res = await request(app)
        .post("/api/v1/properties")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          propertyName: "", // Invalid empty name
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/properties/:id/approve", () => {
    it("should return 403 Forbidden for non-admin approval attempt", async () => {
      const res = await request(app)
        .post("/api/v1/properties/1/approve")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
