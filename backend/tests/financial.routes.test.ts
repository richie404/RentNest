import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt.util";
import { FinancialRepository } from "../src/repositories/financial.repository";
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

describe("Financial Management & Payment Routes Integration Tests", () => {
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
    permissions: ["invoice:create"],
  });

  const adminToken = generateAccessToken({
    userId: 1,
    email: "admin@rentnest.com",
    roleId: 4,
    roleName: "ROLE_ADMIN",
    permissions: ["*"],
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuditLogRepository.prototype, "logAction").mockResolvedValue();
  });

  describe("POST /api/v1/financial/invoices", () => {
    it("should allow property owner to generate lease invoice", async () => {
      vi.spyOn(FinancialRepository.prototype, "generateInvoice").mockResolvedValueOnce({
        invoiceId: 200,
        statusMessage: "SUCCESS: Invoice generated successfully.",
      });

      const response = await request(app)
        .post("/api/v1/financial/invoices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          leaseId: 101,
          billingPeriodStart: "2026-08-01",
          billingPeriodEnd: "2026-08-31",
          dueDate: "2026-08-05",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.invoiceId).toBe(200);
    });

    it("should reject invoice generation by tenant role with 403 Forbidden", async () => {
      const response = await request(app)
        .post("/api/v1/financial/invoices")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          leaseId: 101,
          billingPeriodStart: "2026-08-01",
          billingPeriodEnd: "2026-08-31",
          dueDate: "2026-08-05",
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/financial/payments", () => {
    it("should record payment and update invoice status", async () => {
      vi.spyOn(FinancialRepository.prototype, "recordPayment").mockResolvedValueOnce({
        paymentId: 500,
        statusMessage: "SUCCESS: Payment settled and invoice updated.",
      });

      const response = await request(app)
        .post("/api/v1/financial/payments")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          invoiceId: 200,
          amount: 1500,
          paymentChannel: "STRIPE",
          gatewayTransactionToken: "ch_3N8xY2LkdIwHu4",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentId).toBe(500);
    });
  });

  describe("GET /api/v1/financial/reports/revenue", () => {
    it("should return monthly revenue summary for admin role", async () => {
      vi.spyOn(FinancialRepository.prototype, "getRevenueSummary").mockResolvedValueOnce([
        {
          billing_month: "2026-07",
          total_invoices_issued: 10,
          total_billed_amount: 15000.0,
          total_paid_amount: 15000.0,
          collection_efficiency_percentage: 100.0,
        },
      ]);

      const response = await request(app)
        .get("/api/v1/financial/reports/revenue")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });
});
