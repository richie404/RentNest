import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

describe("Health Check Endpoints Integration Tests", () => {
  it("GET /api/v1/health - should return overall health status", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status === 200 || res.status === 503).toBe(true);
    expect(res.body.success).toBeDefined();
  });

  it("GET /api/v1/health/liveness - should return ALIVE for Kubernetes probe", async () => {
    const res = await request(app).get("/api/v1/health/liveness");
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ALIVE");
  });

  it("GET /api/v1/health/readiness - should return readiness probe response", async () => {
    const res = await request(app).get("/api/v1/health/readiness");
    expect(res.status === 200 || res.status === 503).toBe(true);
  });

  it("GET /api/v1/health/database - should return database health envelope", async () => {
    const res = await request(app).get("/api/v1/health/database");
    expect(res.status === 200 || res.status === 503).toBe(true);
  });

  it("GET /api/v1/health/application - should return application runtime metrics", async () => {
    const res = await request(app).get("/api/v1/health/application");
    expect(res.status).toBe(200);
    expect(res.body.data.uptime).toBeDefined();
  });
});
