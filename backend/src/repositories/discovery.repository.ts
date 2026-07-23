import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { dbPool } from "../config/database.config";

export interface AdvancedSearchFilterOptions {
  search?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  propertyType?: string;
  minRent?: number;
  maxRent?: number;
  minDeposit?: number;
  maxDeposit?: number;
  bedrooms?: number;
  bathrooms?: number;
  minSquareFeet?: number;
  sortBy?: "rent_asc" | "rent_desc" | "newest" | "rating_desc";
  page?: number;
  limit?: number;
}

export class DiscoveryRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Advanced multi-criteria property search using SQL prepared statements
   */
  public async advancedSearch(
    options: AdvancedSearchFilterOptions,
    connection?: PoolConnection
  ): Promise<{ data: any[]; total: number }> {
    const db = this.getDb(connection);
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ["vw.unit_status = 'VACANT'"];
    const params: any[] = [];

    if (options.city) {
      whereClauses.push("LOWER(vw.city) = LOWER(?)");
      params.push(options.city);
    }

    if (options.stateProvince) {
      whereClauses.push("LOWER(vw.state_province) = LOWER(?)");
      params.push(options.stateProvince);
    }

    if (options.postalCode) {
      whereClauses.push("vw.postal_code = ?");
      params.push(options.postalCode);
    }

    if (options.propertyType) {
      whereClauses.push("vw.property_type = ?");
      params.push(options.propertyType);
    }

    if (options.bedrooms !== undefined) {
      whereClauses.push("vw.bedrooms >= ?");
      params.push(options.bedrooms);
    }

    if (options.bathrooms !== undefined) {
      whereClauses.push("vw.bathrooms >= ?");
      params.push(options.bathrooms);
    }

    if (options.minRent !== undefined) {
      whereClauses.push("vw.target_rent >= ?");
      params.push(options.minRent);
    }

    if (options.maxRent !== undefined) {
      whereClauses.push("vw.target_rent <= ?");
      params.push(options.maxRent);
    }

    if (options.minDeposit !== undefined) {
      whereClauses.push("vw.security_deposit_target >= ?");
      params.push(options.minDeposit);
    }

    if (options.maxDeposit !== undefined) {
      whereClauses.push("vw.security_deposit_target <= ?");
      params.push(options.maxDeposit);
    }

    if (options.minSquareFeet !== undefined) {
      whereClauses.push("vw.square_feet >= ?");
      params.push(options.minSquareFeet);
    }

    if (options.search) {
      whereClauses.push(
        "(vw.property_name LIKE ? OR vw.street_address LIKE ? OR vw.city LIKE ?)"
      );
      const term = `%${options.search}%`;
      params.push(term, term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    let orderSql = "ORDER BY vw.unit_id DESC";
    if (options.sortBy === "rent_asc") {
      orderSql = "ORDER BY vw.target_rent ASC";
    } else if (options.sortBy === "rent_desc") {
      orderSql = "ORDER BY vw.target_rent DESC";
    } else if (options.sortBy === "newest") {
      orderSql = "ORDER BY vw.unit_id DESC";
    } else if (options.sortBy === "rating_desc") {
      orderSql = "ORDER BY r.average_rating_score DESC, vw.unit_id DESC";
    }

    const countSql = `
      SELECT COUNT(*) AS total 
      FROM vw_available_properties_units vw
      LEFT JOIN vw_property_ratings_reviews r ON vw.property_id = r.property_id
      ${whereSql}
    `;
    const [countRows] = await db.execute<RowDataPacket[]>(countSql, params);
    const total = Number(countRows[0]?.total || 0);

    const querySql = `
      SELECT 
        vw.*,
        COALESCE(r.average_rating_score, 0) AS average_rating_score,
        COALESCE(r.total_reviews_count, 0) AS total_reviews_count
      FROM vw_available_properties_units vw
      LEFT JOIN vw_property_ratings_reviews r ON vw.property_id = r.property_id
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.execute<RowDataPacket[]>(
      querySql,
      [...params, String(limit), String(offset)]
    );

    return { data: rows as any, total };
  }

  /**
   * SQL-first recommendation engine (highest rated, popular, newest)
   */
  public async getRecommendations(
    limit: number = 6,
    city?: string,
    connection?: PoolConnection
  ): Promise<any[]> {
    const db = this.getDb(connection);
    const params: any[] = [];
    let cityCondition = "";

    if (city) {
      cityCondition = "AND LOWER(vw.city) = LOWER(?)";
      params.push(city);
    }

    params.push(String(limit));

    const sql = `
      SELECT 
        vw.*,
        COALESCE(r.average_rating_score, 5.0) AS average_rating_score,
        COALESCE(r.total_reviews_count, 0) AS total_reviews_count
      FROM vw_available_properties_units vw
      LEFT JOIN vw_property_ratings_reviews r ON vw.property_id = r.property_id
      WHERE vw.unit_status = 'VACANT' ${cityCondition}
      ORDER BY COALESCE(r.average_rating_score, 5.0) DESC, vw.unit_id DESC
      LIMIT ?
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, params);
    return rows as any;
  }

  /**
   * Side-by-side property comparison engine
   */
  public async compareProperties(
    propertyIds: number[],
    connection?: PoolConnection
  ): Promise<any[]> {
    if (propertyIds.length === 0) return [];
    const db = this.getDb(connection);

    const placeholders = propertyIds.map(() => "?").join(",");
    const sql = `
      SELECT 
        p.property_id AS propertyId,
        p.property_name AS propertyName,
        p.property_type AS propertyType,
        p.street_address AS streetAddress,
        p.city,
        p.state_province AS stateProvince,
        p.postal_code AS postalCode,
        COUNT(u.unit_id) AS totalUnits,
        MIN(u.target_rent) AS minRent,
        MAX(u.target_rent) AS maxRent,
        COALESCE(r.average_rating_score, 0) AS averageRating,
        COALESCE(r.total_reviews_count, 0) AS totalReviews
      FROM properties p
      LEFT JOIN units u ON p.property_id = u.property_id
      LEFT JOIN vw_property_ratings_reviews r ON p.property_id = r.property_id
      WHERE p.property_id IN (${placeholders})
      GROUP BY p.property_id
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, propertyIds);
    return rows as any;
  }

  /**
   * Get search suggestions & auto-complete terms
   */
  public async getSearchSuggestions(
    keyword: string,
    connection?: PoolConnection
  ): Promise<{ cities: string[]; properties: string[] }> {
    const db = this.getDb(connection);
    const term = `%${keyword}%`;

    const citySql = `SELECT DISTINCT city FROM properties WHERE city LIKE ? LIMIT 5`;
    const [cityRows] = await db.execute<RowDataPacket[]>(citySql, [term]);

    const propSql = `SELECT DISTINCT property_name FROM properties WHERE property_name LIKE ? LIMIT 5`;
    const [propRows] = await db.execute<RowDataPacket[]>(propSql, [term]);

    return {
      cities: cityRows.map((r) => r.city),
      properties: propRows.map((r) => r.property_name),
    };
  }
}
