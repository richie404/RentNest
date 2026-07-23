import { CommunicationRepository } from "../../repositories/communication.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import {
  CreateConversationDTO,
  SendMessageDTO,
  SendNotificationDTO,
} from "./communication.types";
import { NotFoundError } from "../../utils/app-error";
import { withTransaction } from "../../utils/transaction.util";

export class CommunicationService {
  constructor(
    private communicationRepository: CommunicationRepository,
    private auditLogRepository: AuditLogRepository
  ) {}

  public async createConversation(
    actorUserId: number,
    dto: CreateConversationDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ conversationId: number }> {
    return await withTransaction(async (connection) => {
      const conversationId = await this.communicationRepository.createConversation(
        dto,
        connection
      );

      await this.auditLogRepository.logAction(
        {
          actorUserId,
          actionType: "INSERT",
          targetTable: "conversations",
          recordKey: String(conversationId),
          userAgent,
          ipAddress,
          postImageJson: { dto, conversationId },
        },
        connection
      );

      return { conversationId };
    });
  }

  public async sendMessage(
    senderUserId: number,
    dto: SendMessageDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ messageId: number }> {
    const existing = await this.communicationRepository.findConversationById(dto.conversationId);
    if (!existing) {
      throw new NotFoundError(`Conversation thread with ID ${dto.conversationId} does not exist.`);
    }

    return await withTransaction(async (connection) => {
      const messageId = await this.communicationRepository.sendMessage(
        senderUserId,
        dto,
        connection
      );

      await this.auditLogRepository.logAction(
        {
          actorUserId: senderUserId,
          actionType: "INSERT",
          targetTable: "messages",
          recordKey: String(messageId),
          userAgent,
          ipAddress,
          postImageJson: { dto, messageId },
        },
        connection
      );

      return { messageId };
    });
  }

  public async listMessages(conversationId: number): Promise<any[]> {
    const existing = await this.communicationRepository.findConversationById(conversationId);
    if (!existing) {
      throw new NotFoundError(`Conversation thread with ID ${conversationId} does not exist.`);
    }
    return this.communicationRepository.listMessages(conversationId);
  }

  public async sendNotification(
    actorUserId: number,
    dto: SendNotificationDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ notificationId: number }> {
    return await withTransaction(async (connection) => {
      const notificationId = await this.communicationRepository.createNotification(
        dto,
        connection
      );

      await this.auditLogRepository.logAction(
        {
          actorUserId,
          actionType: "INSERT",
          targetTable: "notifications",
          recordKey: String(notificationId),
          userAgent,
          ipAddress,
          postImageJson: { dto, notificationId },
        },
        connection
      );

      return { notificationId };
    });
  }

  public async listUserNotifications(recipientUserId: number): Promise<any[]> {
    return this.communicationRepository.listUserNotifications(recipientUserId);
  }
}
