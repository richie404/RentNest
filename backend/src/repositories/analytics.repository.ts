import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { dbPool } from "../config/database.config";

export class AnalyticsRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Executive Platform KPI Overview
   */
  public async getAdminExecutiveSummary(connection?: PoolConnection): Promise<any> {
    const db = this.getDb(connection);
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM properties) AS totalProperties,
        (SELECT COUNT(*) FROM units) AS totalUnits,
        (SELECT COUNT(*) FROM units WHERE is_available = TRUE) AS vacantUnits,
        (SELECT COUNT(*) FROM leases WHERE status = 'ACTIVE') AS activeLeases,
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'SETTLED') AS totalGrossRevenueSettled,
        (SELECT COUNT(*) FROM maintenance_requests WHERE status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS')) AS openMaintenanceTickets
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql);
    return rows[0] || {};
  }

  /**
   * Portfolio Occupancy Metrics
   */
  public async getOccupancyAnalytics(connection?: PoolConnection): Promise<any> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        COUNT(*) AS totalUnits,
        SUM(CASE WHEN is_available = FALSE THEN 1 ELSE 0 END) AS occupiedUnits,
        SUM(CASE WHEN is_available = TRUE THEN 1 ELSE 0 END) AS vacantUnits,
        ROUND((SUM(CASE WHEN is_available = FALSE THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS occupancyRatePercentage
      FROM units
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql);
    return rows[0] || {};
  }

  /**
   * Monthly Revenue Trends from vw_monthly_revenue_summary
   */
  public async getRevenueTrends(connection?: PoolConnection): Promise<any[]> {
    const db = this.getDb(connection);
    const sql = `SELECT * FROM vw_monthly_revenue_summary ORDER BY billing_month DESC LIMIT 12`;
    const [rows] = await db.execute<RowDataPacket[]>(sql);
    return rows as any;
  }

  /**
   * Maintenance Analytics & Dispatch Overview
   */
  public async getMaintenanceAnalytics(connection?: PoolConnection): Promise<any> {
    const db = this.getDb(connection);
    const sql = `
      SELECT
        priority_level AS priorityLevel,
        COUNT(*) AS ticketCount
      FROM maintenance_requests
      GROUP BY priority_level
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql);
    return rows as any;
  }
}
