import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { dbPool } from "../config/database.config";

export class AdminRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * List global audit logs with pagination & filtering
   */
  public async getAuditLogs(
    targetTable?: string,
    actionType?: string,
    limit: number = 50,
    offset: number = 0,
    connection?: PoolConnection
  ): Promise<any[]> {
    const db = this.getDb(connection);
    let sql = `
      SELECT 
        al.audit_id AS auditId, al.actor_user_id AS actorUserId, al.action_type AS actionType,
        al.target_table AS targetTable, al.record_key AS recordKey, al.ip_address AS ipAddress,
        al.created_at AS createdAt, u.email AS actorEmail
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_user_id = u.user_id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (targetTable) {
      conditions.push("al.target_table = ?");
      params.push(targetTable);
    }
    if (actionType) {
      conditions.push("al.action_type = ?");
      params.push(actionType);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.execute<RowDataPacket[]>(sql, params);
    return rows as any;
  }

  /**
   * Global platform search across users, properties, and leases
   */
  public async globalSearch(query: string, connection?: PoolConnection): Promise<any> {
    const db = this.getDb(connection);
    const searchTerm = `%${query}%`;

    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT user_id AS userId, email, role_id AS roleId, is_active AS isActive FROM users WHERE email LIKE ? LIMIT 5",
      [searchTerm]
    );

    const [properties] = await db.execute<RowDataPacket[]>(
      "SELECT property_id AS propertyId, property_name AS propertyName, city, status FROM properties WHERE property_name LIKE ? OR city LIKE ? LIMIT 5",
      [searchTerm, searchTerm]
    );

    return {
      users,
      properties,
    };
  }

  /**
   * Security overview dashboard
   */
  public async getSecurityDashboardMetrics(connection?: PoolConnection): Promise<any> {
    const db = this.getDb(connection);
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM user_sessions WHERE is_revoked = FALSE) AS activeSessionsCount,
        (SELECT COUNT(*) FROM audit_logs WHERE created_at >= NOW() - INTERVAL 24 HOUR) AS auditEvents24h,
        (SELECT COUNT(*) FROM users WHERE is_active = FALSE) AS suspendedUsersCount
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql);
    return rows[0] || {};
  }
}
