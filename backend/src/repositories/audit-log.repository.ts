import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { dbPool } from "../config/database.config";

export interface AuditLogEntry {
  actorUserId?: number | null;
  actionType: "INSERT" | "UPDATE" | "DELETE" | "OVERRIDE";
  targetTable: string;
  recordKey: string;
  correlationId?: string;
  userAgent?: string;
  ipAddress?: string;
  preImageJson?: any;
  postImageJson?: any;
}

export class AuditLogRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  public async logAction(
    entry: AuditLogEntry,
    connection?: PoolConnection
  ): Promise<number> {
    const db = this.getDb(connection);
    const sql = `
      INSERT INTO audit_logs (
        actor_user_id, action_type, target_table, record_key, correlation_id,
        user_agent, ip_address, pre_image_json, post_image_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute<ResultSetHeader>(sql, [
      entry.actorUserId || null,
      entry.actionType,
      entry.targetTable,
      entry.recordKey,
      entry.correlationId || null,
      entry.userAgent || null,
      entry.ipAddress || null,
      entry.preImageJson ? JSON.stringify(entry.preImageJson) : null,
      entry.postImageJson ? JSON.stringify(entry.postImageJson) : null,
    ]);

    return result.insertId;
  }

  public async getAuditLogsForUser(
    userId: number,
    connection?: PoolConnection
  ): Promise<any[]> {
    const db = this.getDb(connection);
    const sql = `
      SELECT log_id AS logId, actor_user_id AS actorUserId, action_type AS actionType,
             target_table AS targetTable, record_key AS recordKey, user_agent AS userAgent,
             ip_address AS ipAddress, pre_image_json AS preImageJson, post_image_json AS postImageJson,
             created_at AS createdAt
      FROM audit_logs
      WHERE actor_user_id = ? OR (target_table = 'users' AND record_key = ?)
      ORDER BY created_at DESC
      LIMIT 100
    `;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [userId, String(userId)]);
    return rows;
  }
}
