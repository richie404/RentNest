import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { dbPool } from "../config/database.config";

export class IntelligenceRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Semantic property search query using Full-Text index ft_properties_search
   */
  public async semanticSearchProperties(queryText: string, connection?: PoolConnection): Promise<any[]> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        p.property_id AS propertyId, p.property_name AS propertyName,
        p.city, p.state, p.base_monthly_rent AS baseMonthlyRent,
        p.rating, MATCH(p.property_name, p.description, p.address_line1, p.city) AGAINST(? IN NATURAL LANGUAGE MODE) AS relevanceScore
      FROM properties p
      WHERE p.status = 'APPROVED'
      ORDER BY relevanceScore DESC, p.rating DESC
      LIMIT 20
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [queryText]);
    return rows as any;
  }

  /**
   * Query fraud detection flags for tenant applications
   */
  public async getFraudRiskFlags(applicationId: number, connection?: PoolConnection): Promise<any> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        ra.application_id AS applicationId, ra.applicant_user_id AS applicantUserId,
        ra.monthly_income AS declaredIncome, u.email,
        (CASE WHEN ra.monthly_income < 1000 THEN 'HIGH_FINANCIAL_RISK' ELSE 'LOW_RISK' END) AS riskFlag
      FROM rental_applications ra
      JOIN users u ON ra.applicant_user_id = u.user_id
      WHERE ra.application_id = ?
      LIMIT 1
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [applicationId]);
    return rows[0] || null;
  }
}
