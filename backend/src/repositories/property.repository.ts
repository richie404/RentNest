import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../config/database.config";
import {
  CreatePropertyDTO,
  UpdatePropertyDTO,
  CreateUnitDTO,
  UpdateUnitDTO,
  PropertyFilterOptions,
  SubmitReviewDTO,
} from "../types/property.types";

export class PropertyRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Create Property & Initial Unit via Stored Procedure sp_CreateProperty
   */
  public async createProperty(
    ownerId: number,
    dto: CreatePropertyDTO,
    connection?: PoolConnection
  ): Promise<{ propertyId: number; unitId: number; statusMessage: string }> {
    const db = this.getDb(connection);
    await db.query<RowDataPacket[][]>(
      "CALL sp_CreateProperty(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @out_property_id, @out_unit_id, @out_status_message)",
      [
        ownerId,
        dto.propertyName,
        dto.propertyType,
        dto.streetAddress,
        dto.city,
        dto.stateProvince,
        dto.postalCode,
        dto.unitNumber,
        dto.bedrooms,
        dto.bathrooms,
        dto.targetRent,
        dto.deposit,
      ]
    );

    const [outRows] = await db.query<RowDataPacket[]>(
      "SELECT @out_property_id AS propertyId, @out_unit_id AS unitId, @out_status_message AS statusMessage"
    );

    const propertyId = Number(outRows[0]?.propertyId || 0);
    const unitId = Number(outRows[0]?.unitId || 0);
    const statusMessage = String(outRows[0]?.statusMessage || "");

    if (dto.squareFeet && unitId > 0) {
      await db.execute("UPDATE units SET square_feet = ? WHERE unit_id = ?", [
        dto.squareFeet,
        unitId,
      ]);
    }

    return { propertyId, unitId, statusMessage };
  }

  /**
   * Approve Property via Stored Procedure sp_ApproveProperty
   */
  public async approveProperty(
    propertyId: number,
    adminUserId: number,
    connection?: PoolConnection
  ): Promise<string> {
    const db = this.getDb(connection);
    await db.query<RowDataPacket[][]>("CALL sp_ApproveProperty(?, ?, @out_status_message)", [
      propertyId,
      adminUserId,
    ]);

    const [outRows] = await db.query<RowDataPacket[]>(
      "SELECT @out_status_message AS statusMessage"
    );

    return String(outRows[0]?.statusMessage || "");
  }

  /**
   * Find property by ID with units, amenities, media, owner profile
   */
  public async findPropertyById(
    propertyId: number,
    connection?: PoolConnection
  ): Promise<any | null> {
    const db = this.getDb(connection);

    // Fetch property core
    const pSql = `
      SELECT p.*, up.first_name AS owner_first_name, up.last_name AS owner_last_name, u.email AS owner_email
      FROM properties p
      JOIN users u ON p.owner_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE p.property_id = ?
      LIMIT 1
    `;
    const [pRows] = await db.execute<RowDataPacket[]>(pSql, [propertyId]);
    if (pRows.length === 0) return null;

    const prop = pRows[0];

    // Fetch units
    const uSql = "SELECT * FROM units WHERE property_id = ? ORDER BY unit_id ASC";
    const [units] = await db.execute<RowDataPacket[]>(uSql, [propertyId]);

    // Fetch property amenities
    const aSql = `
      SELECT a.* FROM property_amenities pa
      JOIN amenities a ON pa.amenity_id = a.amenity_id
      WHERE pa.property_id = ?
    `;
    const [amenities] = await db.execute<RowDataPacket[]>(aSql, [propertyId]);

    // Fetch property media
    const mSql = "SELECT * FROM property_media WHERE property_id = ? ORDER BY is_primary DESC, media_id ASC";
    const [media] = await db.execute<RowDataPacket[]>(mSql, [propertyId]);

    // Fetch average rating
    const rSql = "SELECT average_rating_score, total_reviews_count FROM vw_property_ratings_reviews WHERE property_id = ?";
    const [ratingRows] = await db.execute<RowDataPacket[]>(rSql, [propertyId]);

    return {
      propertyId: prop.property_id,
      ownerId: prop.owner_id,
      propertyName: prop.property_name,
      propertyType: prop.property_type,
      streetAddress: prop.street_address,
      city: prop.city,
      stateProvince: prop.state_province,
      postalCode: prop.postal_code,
      country: prop.country,
      createdAt: prop.created_at,
      updatedAt: prop.updated_at,
      owner: {
        firstName: prop.owner_first_name,
        lastName: prop.owner_last_name,
        email: prop.owner_email,
      },
      rating: ratingRows[0]
        ? {
            averageScore: Number(ratingRows[0].average_rating_score),
            totalReviews: Number(ratingRows[0].total_reviews_count),
          }
        : { averageScore: 0, totalReviews: 0 },
      units: units as any,
      amenities: amenities as any,
      media: media as any,
    };
  }

  /**
   * Search / Filter / Sort available properties and units leveraging vw_available_properties_units
   */
  public async searchProperties(
    options: PropertyFilterOptions,
    connection?: PoolConnection
  ): Promise<{ data: any[]; total: number }> {
    const db = this.getDb(connection);
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ["vw.unit_status = 'VACANT'"];
    const params: any[] = [];

    if (options.city) {
      whereClauses.push("vw.city = ?");
      params.push(options.city);
    }

    if (options.stateProvince) {
      whereClauses.push("vw.state_province = ?");
      params.push(options.stateProvince);
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

    if (options.search) {
      whereClauses.push("(vw.property_name LIKE ? OR vw.street_address LIKE ? OR vw.city LIKE ?)");
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
    }

    const countSql = `SELECT COUNT(*) AS total FROM vw_available_properties_units vw ${whereSql}`;
    const [countRows] = await db.execute<RowDataPacket[]>(countSql, params);
    const total = Number(countRows[0]?.total || 0);

    const querySql = `
      SELECT vw.* 
      FROM vw_available_properties_units vw 
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.execute<RowDataPacket[]>(querySql, [...params, String(limit), String(offset)]);

    return { data: rows as any, total };
  }

  /**
   * Update Property
   */
  public async updateProperty(
    propertyId: number,
    dto: UpdatePropertyDTO,
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    const updates: string[] = [];
    const params: any[] = [];

    if (dto.propertyName !== undefined) {
      updates.push("property_name = ?");
      params.push(dto.propertyName);
    }
    if (dto.propertyType !== undefined) {
      updates.push("property_type = ?");
      params.push(dto.propertyType);
    }
    if (dto.streetAddress !== undefined) {
      updates.push("street_address = ?");
      params.push(dto.streetAddress);
    }
    if (dto.city !== undefined) {
      updates.push("city = ?");
      params.push(dto.city);
    }
    if (dto.stateProvince !== undefined) {
      updates.push("state_province = ?");
      params.push(dto.stateProvince);
    }
    if (dto.postalCode !== undefined) {
      updates.push("postal_code = ?");
      params.push(dto.postalCode);
    }
    if (dto.country !== undefined) {
      updates.push("country = ?");
      params.push(dto.country);
    }

    if (updates.length === 0) return;

    params.push(propertyId);
    await db.execute(`UPDATE properties SET ${updates.join(", ")} WHERE property_id = ?`, params);
  }

  /**
   * Delete Property
   */
  public async deleteProperty(propertyId: number, connection?: PoolConnection): Promise<void> {
    const db = this.getDb(connection);
    await db.execute("DELETE FROM properties WHERE property_id = ?", [propertyId]);
  }

  /**
   * Add Unit to Property
   */
  public async createUnit(
    propertyId: number,
    dto: CreateUnitDTO,
    connection?: PoolConnection
  ): Promise<number> {
    const db = this.getDb(connection);
    const sql = `
      INSERT INTO units (property_id, unit_number, bedrooms, bathrooms, square_feet, target_rent, security_deposit_target, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute<ResultSetHeader>(sql, [
      propertyId,
      dto.unitNumber,
      dto.bedrooms,
      dto.bathrooms,
      dto.squareFeet || null,
      dto.targetRent,
      dto.securityDepositTarget,
      dto.status || "VACANT",
    ]);
    return result.insertId;
  }

  /**
   * Update Unit details & status
   */
  public async updateUnit(
    unitId: number,
    dto: UpdateUnitDTO,
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    const updates: string[] = [];
    const params: any[] = [];

    if (dto.unitNumber !== undefined) {
      updates.push("unit_number = ?");
      params.push(dto.unitNumber);
    }
    if (dto.bedrooms !== undefined) {
      updates.push("bedrooms = ?");
      params.push(dto.bedrooms);
    }
    if (dto.bathrooms !== undefined) {
      updates.push("bathrooms = ?");
      params.push(dto.bathrooms);
    }
    if (dto.squareFeet !== undefined) {
      updates.push("square_feet = ?");
      params.push(dto.squareFeet);
    }
    if (dto.targetRent !== undefined) {
      updates.push("target_rent = ?");
      params.push(dto.targetRent);
    }
    if (dto.securityDepositTarget !== undefined) {
      updates.push("security_deposit_target = ?");
      params.push(dto.securityDepositTarget);
    }
    if (dto.status !== undefined) {
      updates.push("status = ?");
      params.push(dto.status);
    }

    if (updates.length === 0) return;

    params.push(unitId);
    await db.execute(`UPDATE units SET ${updates.join(", ")} WHERE unit_id = ?`, params);
  }

  /**
   * Add media asset
   */
  public async addMedia(
    propertyId: number,
    mediaUrl: string,
    mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" = "IMAGE",
    unitId?: number,
    isPrimary: boolean = false,
    caption?: string,
    connection?: PoolConnection
  ): Promise<number> {
    const db = this.getDb(connection);
    const sql = `
      INSERT INTO property_media (property_id, unit_id, media_type, media_url, is_primary, caption)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute<ResultSetHeader>(sql, [
      propertyId,
      unitId || null,
      mediaType,
      mediaUrl,
      isPrimary,
      caption || null,
    ]);
    return result.insertId;
  }

  /**
   * Favorites handling
   */
  public async addFavorite(userId: number, unitId: number, connection?: PoolConnection): Promise<void> {
    const db = this.getDb(connection);
    await db.execute("INSERT IGNORE INTO favorites (user_id, unit_id) VALUES (?, ?)", [
      userId,
      unitId,
    ]);
  }

  public async removeFavorite(userId: number, unitId: number, connection?: PoolConnection): Promise<void> {
    const db = this.getDb(connection);
    await db.execute("DELETE FROM favorites WHERE user_id = ? AND unit_id = ?", [
      userId,
      unitId,
    ]);
  }

  public async getUserFavorites(userId: number, connection?: PoolConnection): Promise<any[]> {
    const db = this.getDb(connection);
    const sql = `
      SELECT f.created_at AS favorited_at, vw.*
      FROM favorites f
      JOIN vw_available_properties_units vw ON f.unit_id = vw.unit_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [userId]);
    return rows as any;
  }

  /**
   * Submit Property Review via Stored Procedure sp_SubmitReview
   */
  public async submitReview(
    reviewerId: number,
    dto: SubmitReviewDTO,
    connection?: PoolConnection
  ): Promise<string> {
    const db = this.getDb(connection);
    await db.query<RowDataPacket[][]>("CALL sp_SubmitReview(?, ?, ?, ?, ?, @out_status_message)", [
      dto.leaseId,
      reviewerId,
      dto.revieweeUserId,
      dto.rating,
      dto.reviewText,
    ]);

    const [outRows] = await db.query<RowDataPacket[]>(
      "SELECT @out_status_message AS statusMessage"
    );

    return String(outRows[0]?.statusMessage || "");
  }

  /**
   * List property reviews
   */
  public async getPropertyReviews(propertyId: number, connection?: PoolConnection): Promise<any[]> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        r.review_id AS reviewId, r.rating, r.review_text AS reviewText, r.created_at AS createdAt,
        up.first_name AS reviewerFirstName, up.last_name AS reviewerLastName
      FROM reviews r
      JOIN leases l ON r.lease_id = l.lease_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN user_profiles up ON r.reviewer_user_id = up.user_id
      WHERE u.property_id = ? AND r.is_published = TRUE
      ORDER BY r.created_at DESC
    `;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [propertyId]);
    return rows as any;
  }
}
