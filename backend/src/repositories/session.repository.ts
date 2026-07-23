import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../config/database.config";
import { SessionRecord } from "../types/auth.types";

export class SessionRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Ensure user_sessions table exists
   */
  public async ensureTableExists(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS \`user_sessions\` (
        \`session_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` BIGINT UNSIGNED NOT NULL,
        \`refresh_token_hash\` VARCHAR(255) NOT NULL,
        \`user_agent\` VARCHAR(255) NULL,
        \`ip_address\` VARCHAR(45) NULL,
        \`is_revoked\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`expires_at\` TIMESTAMP NOT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_sessions_user\` (\`user_id\`, \`is_revoked\`),
        CONSTRAINT \`fk_sessions_user\` FOREIGN KEY (\`user_id\`) 
          REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;
    await dbPool.query(sql);
  }

  /**
   * Create a new session record
   */
  public async createSession(
    userId: number,
    refreshTokenHash: string,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string,
    connection?: PoolConnection
  ): Promise<number> {
    await this.ensureTableExists();
    const db = this.getDb(connection);
    const sql = `
      INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute<ResultSetHeader>(sql, [
      userId,
      refreshTokenHash,
      userAgent || null,
      ipAddress || null,
      expiresAt,
    ]);

    return result.insertId;
  }

  /**
   * Find an active session by token hash
   */
  public async findActiveSession(
    refreshTokenHash: string,
    connection?: PoolConnection
  ): Promise<SessionRecord | null> {
    await this.ensureTableExists();
    const db = this.getDb(connection);
    const sql = `
      SELECT * FROM user_sessions 
      WHERE refresh_token_hash = ? AND is_revoked = FALSE AND expires_at > NOW()
      LIMIT 1
    `;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [refreshTokenHash]);
    if (rows.length === 0) return null;
    return rows[0] as SessionRecord;
  }

  /**
   * List active sessions for a user
   */
  public async getUserSessions(
    userId: number,
    connection?: PoolConnection
  ): Promise<SessionRecord[]> {
    await this.ensureTableExists();
    const db = this.getDb(connection);
    const sql = `
      SELECT session_id, user_id, user_agent, ip_address, is_revoked, expires_at, created_at
      FROM user_sessions
      WHERE user_id = ? AND is_revoked = FALSE AND expires_at > NOW()
      ORDER BY created_at DESC
    `;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [userId]);
    return rows as SessionRecord[];
  }

  /**
   * Revoke a specific session by token hash
   */
  public async revokeSession(
    refreshTokenHash: string,
    connection?: PoolConnection
  ): Promise<void> {
    await this.ensureTableExists();
    const db = this.getDb(connection);
    await db.execute("UPDATE user_sessions SET is_revoked = TRUE WHERE refresh_token_hash = ?", [
      refreshTokenHash,
    ]);
  }

  /**
   * Revoke a specific session by sessionId
   */
  public async revokeSessionById(
    sessionId: number,
    userId: number,
    connection?: PoolConnection
  ): Promise<void> {
    await this.ensureTableExists();
    const db = this.getDb(connection);
    await db.execute(
      "UPDATE user_sessions SET is_revoked = TRUE WHERE session_id = ? AND user_id = ?",
      [sessionId, userId]
    );
  }

  /**
   * Revoke all other sessions except current
   */
  public async revokeOtherSessions(
    userId: number,
    currentSessionId: number,
    connection?: PoolConnection
  ): Promise<void> {
    await this.ensureTableExists();
    const db = this.getDb(connection);
    await db.execute(
      "UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = ? AND session_id != ?",
      [userId, currentSessionId]
    );
  }

  /**
   * Revoke all sessions for a user
   */
  public async revokeAllUserSessions(
    userId: number,
    connection?: PoolConnection
  ): Promise<void> {
    await this.ensureTableExists();
    const db = this.getDb(connection);
    await db.execute("UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = ?", [userId]);
  }
}
