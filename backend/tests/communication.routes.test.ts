import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt.util";
import { CommunicationRepository } from "../src/repositories/communication.repository";
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

describe("Enterprise Messaging & Notification Engine Integration Tests", () => {
  const tenantToken = generateAccessToken({
    userId: 20,
    email: "tenant@rentnest.com",
    roleId: 1,
    roleName: "ROLE_TENANT",
    permissions: [],
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

  describe("POST /api/v1/communication/conversations", () => {
    it("should allow user to initiate context-bound conversation thread", async () => {
      vi.spyOn(CommunicationRepository.prototype, "createConversation").mockResolvedValueOnce(400);

      const response = await request(app)
        .post("/api/v1/communication/conversations")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          contextType: "LEASE",
          contextId: 101,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.conversationId).toBe(400);
    });

    it("should fail validation if contextType is invalid enum", async () => {
      const response = await request(app)
        .post("/api/v1/communication/conversations")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          contextType: "INVALID_TYPE",
          contextId: 101,
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/communication/messages", () => {
    it("should dispatch message to existing conversation thread", async () => {
      vi.spyOn(CommunicationRepository.prototype, "findConversationById").mockResolvedValueOnce({
        conversationId: 400,
        contextType: "LEASE",
      });

      vi.spyOn(CommunicationRepository.prototype, "sendMessage").mockResolvedValueOnce(1500);

      const response = await request(app)
        .post("/api/v1/communication/messages")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          conversationId: 400,
          messageBody: "Hello, when can I expect the maintenance team?",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.messageId).toBe(1500);
    });

    it("should return 404 Not Found if target conversation thread missing", async () => {
      vi.spyOn(CommunicationRepository.prototype, "findConversationById").mockResolvedValueOnce(null);

      const response = await request(app)
        .post("/api/v1/communication/messages")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          conversationId: 9999,
          messageBody: "Hello?",
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/communication/notifications", () => {
    it("should queue and dispatch notification for admin user", async () => {
      vi.spyOn(CommunicationRepository.prototype, "createNotification").mockResolvedValueOnce(800);

      const response = await request(app)
        .post("/api/v1/communication/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          recipientUserId: 20,
          channelType: "IN_APP",
          title: "Rent Payment Received",
          messageBody: "Your payment of $1,500 for August rent was received.",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notificationId).toBe(800);
    });

    it("should reject notification dispatch by non-admin/manager role with 403", async () => {
      const response = await request(app)
        .post("/api/v1/communication/notifications")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send({
          recipientUserId: 10,
          channelType: "IN_APP",
          title: "Test",
          messageBody: "Unauthorized dispatch attempt.",
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
