import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../config/database.config";

export interface CreateConversationDTO {
  contextType: "LEASE" | "APPLICATION" | "MAINTENANCE";
  contextId: number;
}

export interface SendMessageDTO {
  conversationId: number;
  messageBody: string;
  attachmentUrl?: string;
}

export interface SendNotificationDTO {
  recipientUserId: number;
  channelType: "EMAIL" | "SMS" | "IN_APP" | "PUSH";
  title: string;
  messageBody: string;
}

export class CommunicationRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Create conversation
   */
  public async createConversation(
    dto: CreateConversationDTO,
    connection?: PoolConnection
  ): Promise<number> {
    const db = this.getDb(connection);
    const sql = `
      INSERT INTO conversations (context_type, context_id)
      VALUES (?, ?)
    `;

    const [result] = await db.execute<ResultSetHeader>(sql, [
      dto.contextType,
      dto.contextId,
    ]);

    return result.insertId;
  }

  /**
   * Find conversation by ID
   */
  public async findConversationById(
    conversationId: number,
    connection?: PoolConnection
  ): Promise<any | null> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        c.conversation_id AS conversationId, c.context_type AS contextType,
        c.context_id AS contextId, c.created_at AS createdAt
      FROM conversations c
      WHERE c.conversation_id = ?
      LIMIT 1
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [conversationId]);
    return rows[0] || null;
  }

  /**
   * Send message
   */
  public async sendMessage(
    senderUserId: number,
    dto: SendMessageDTO,
    connection?: PoolConnection
  ): Promise<number> {
    const db = this.getDb(connection);
    const sql = `
      INSERT INTO messages (conversation_id, sender_user_id, message_body, attachment_url)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute<ResultSetHeader>(sql, [
      dto.conversationId,
      senderUserId,
      dto.messageBody,
      dto.attachmentUrl || null,
    ]);

    return result.insertId;
  }

  /**
   * List messages for a conversation
   */
  public async listMessages(
    conversationId: number,
    connection?: PoolConnection
  ): Promise<any[]> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        m.message_id AS messageId, m.conversation_id AS conversationId, m.sender_user_id AS senderUserId,
        m.message_body AS messageBody, m.attachment_url AS attachmentUrl, m.sent_at AS sentAt,
        up.first_name AS senderFirstName, up.last_name AS senderLastName
      FROM messages m
      JOIN users u ON m.sender_user_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE m.conversation_id = ?
      ORDER BY m.sent_at ASC
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [conversationId]);
    return rows as any;
  }

  /**
   * Create in-app or system notification
   */
  public async createNotification(
    dto: SendNotificationDTO,
    connection?: PoolConnection
  ): Promise<number> {
    const db = this.getDb(connection);
    const sql = `
      INSERT INTO notifications (recipient_user_id, channel_type, title, message_body, delivery_status, sent_at)
      VALUES (?, ?, ?, ?, 'SENT', NOW())
    `;

    const [result] = await db.execute<ResultSetHeader>(sql, [
      dto.recipientUserId,
      dto.channelType,
      dto.title,
      dto.messageBody,
    ]);

    return result.insertId;
  }

  /**
   * List notifications for user
   */
  public async listUserNotifications(
    recipientUserId: number,
    connection?: PoolConnection
  ): Promise<any[]> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        n.notification_id AS notificationId, n.recipient_user_id AS recipientUserId,
        n.channel_type AS channelType, n.title, n.message_body AS messageBody,
        n.delivery_status AS deliveryStatus, n.sent_at AS sentAt
      FROM notifications n
      WHERE n.recipient_user_id = ?
      ORDER BY n.sent_at DESC
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [recipientUserId]);
    return rows as any;
  }
}
