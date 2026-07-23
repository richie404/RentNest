import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../config/database.config";
import { SecurityTokenRecord } from "../types/auth.types";

export class SecurityTokenRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Ensure user_security_tokens table exists
   */
  public async ensureTableExists(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS \`user_security_tokens\` (
        \`token_id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` BIGINT UNSIGNED NOT NULL,
        \`token_type\` VARCHAR(50) NOT NULL,
        \`token_hash\` VARCHAR(255) NOT NULL,
        \`is_used\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`expires_at\` TIMESTAMP NOT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_security_tokens_hash\` (\`token_hash\`(100), \`token_type\`, \`is_used\`),
        CONSTRAINT \`fk_sec_tokens_user\` FOREIGN KEY (\`user_id\`) 
          REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;
    await dbPool.query(sql);
  }

  /**
   * Store a security token
   */
  public async createToken(
    userId: number,
    tokenType: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
    tokenHash: string,
    expiresAt: Date,
    connection?: PoolConnection
  ): Promise<number> {
    await this.ensureTableExists();
    const db = this.getDb(connection);
    const sql = `
      INSERT INTO user_security_tokens (user_id, token_type, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute<ResultSetHeader>(sql, [
      userId,
      tokenType,
      tokenHash,
      expiresAt,
    ]);
    return result.insertId;
  }

  /**
   * Find a valid security token
   */
  public async findValidToken(
    tokenType: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
    tokenHash: string,
    connection?: PoolConnection
  ): Promise<SecurityTokenRecord | null> {
    await this.ensureTableExists();
    const db = this.getDb(connection);
    const sql = `
      SELECT * FROM user_security_tokens
      WHERE token_type = ? AND token_hash = ? AND is_used = FALSE AND expires_at > NOW()
      LIMIT 1
    `;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [tokenType, tokenHash]);
    if (rows.length === 0) return null;
    return rows[0] as SecurityTokenRecord;
  }

  /**
   * Mark token as used
   */
  public async markTokenUsed(tokenId: number, connection?: PoolConnection): Promise<void> {
    await this.ensureTableExists();
    const db = this.getDb(connection);
    await db.execute("UPDATE user_security_tokens SET is_used = TRUE WHERE token_id = ?", [
      tokenId,
    ]);
  }
}
