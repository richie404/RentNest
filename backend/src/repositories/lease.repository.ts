import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../config/database.config";

export interface CreateBookingDTO {
  unitId: number;
  startDate: string;
  endDate: string;
  monthlyRent: number;
}

export interface CreateApplicationDTO {
  unitId: number;
  desiredMoveInDate: string;
  proposedLeaseMonths?: number;
  declaredOccupantsCount?: number;
}

export class LeaseRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Book property / Create active lease via sp_BookProperty
   */
  public async bookProperty(
    tenantUserId: number,
    dto: CreateBookingDTO,
    connection?: PoolConnection
  ): Promise<{ leaseId: number; statusMessage: string }> {
    const db = this.getDb(connection);
    await db.query<RowDataPacket[][]>(
      "CALL sp_BookProperty(?, ?, ?, ?, ?, @out_lease_id, @out_status_message)",
      [dto.unitId, tenantUserId, dto.startDate, dto.endDate, dto.monthlyRent]
    );

    const [outRows] = await db.query<RowDataPacket[]>(
      "SELECT @out_lease_id AS leaseId, @out_status_message AS statusMessage"
    );

    const leaseId = Number(outRows[0]?.leaseId || 0);
    const statusMessage = String(outRows[0]?.statusMessage || "");

    return { leaseId, statusMessage };
  }

  /**
   * Submit rental application
   */
  public async submitApplication(
    applicantUserId: number,
    dto: CreateApplicationDTO,
    connection?: PoolConnection
  ): Promise<number> {
    const db = this.getDb(connection);
    const sql = `
      INSERT INTO rental_applications (
        unit_id, applicant_user_id, desired_move_in_date, proposed_lease_months, declared_occupants_count, status
      ) VALUES (?, ?, ?, ?, ?, 'SUBMITTED')
    `;

    const [result] = await db.execute<ResultSetHeader>(sql, [
      dto.unitId,
      applicantUserId,
      dto.desiredMoveInDate,
      dto.proposedLeaseMonths || 12,
      dto.declaredOccupantsCount || 1,
    ]);

    return result.insertId;
  }

  /**
   * Update rental application status
   */
  public async updateApplicationStatus(
    applicationId: number,
    status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN",
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    await db.execute(
      "UPDATE rental_applications SET status = ? WHERE application_id = ?",
      [status, applicationId]
    );
  }

  /**
   * Find application by ID
   */
  public async findApplicationById(
    applicationId: number,
    connection?: PoolConnection
  ): Promise<any | null> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        ra.application_id AS applicationId, ra.unit_id AS unitId, ra.applicant_user_id AS applicantUserId,
        ra.desired_move_in_date AS desiredMoveInDate, ra.proposed_lease_months AS proposedLeaseMonths,
        ra.declared_occupants_count AS declaredOccupantsCount, ra.status, ra.submitted_at AS submittedAt,
        u.unit_number AS unitNumber, p.property_name AS propertyName, p.property_id AS propertyId, p.owner_id AS ownerId,
        up.first_name AS applicantFirstName, up.last_name AS applicantLastName, usr.email AS applicantEmail
      FROM rental_applications ra
      JOIN units u ON ra.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      JOIN users usr ON ra.applicant_user_id = usr.user_id
      LEFT JOIN user_profiles up ON usr.user_id = up.user_id
      WHERE ra.application_id = ?
      LIMIT 1
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [applicationId]);
    return rows[0] || null;
  }

  /**
   * List applications for a tenant or owner
   */
  public async listApplications(
    userId: number,
    isOwner: boolean = false,
    connection?: PoolConnection
  ): Promise<any[]> {
    const db = this.getDb(connection);
    let sql = `
      SELECT 
        ra.application_id AS applicationId, ra.unit_id AS unitId, ra.applicant_user_id AS applicantUserId,
        ra.desired_move_in_date AS desiredMoveInDate, ra.proposed_lease_months AS proposedLeaseMonths,
        ra.status, ra.submitted_at AS submittedAt,
        u.unit_number AS unitNumber, p.property_name AS propertyName,
        up.first_name AS applicantFirstName, up.last_name AS applicantLastName
      FROM rental_applications ra
      JOIN units u ON ra.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      LEFT JOIN user_profiles up ON ra.applicant_user_id = up.user_id
    `;

    if (isOwner) {
      sql += " WHERE p.owner_id = ? ORDER BY ra.submitted_at DESC";
    } else {
      sql += " WHERE ra.applicant_user_id = ? ORDER BY ra.submitted_at DESC";
    }

    const [rows] = await db.execute<RowDataPacket[]>(sql, [userId]);
    return rows as any;
  }

  /**
   * Find lease detail by ID
   */
  public async findLeaseById(
    leaseId: number,
    connection?: PoolConnection
  ): Promise<any | null> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        l.lease_id AS leaseId, l.unit_id AS unitId, l.start_date AS startDate, l.end_date AS endDate,
        l.monthly_base_rent AS monthlyBaseRent, l.due_day_of_month AS dueDayOfMonth, l.status,
        u.unit_number AS unitNumber, p.property_id AS propertyId, p.property_name AS propertyName,
        p.owner_id AS ownerId, p.street_address AS streetAddress, p.city, p.state_province AS stateProvince
      FROM leases l
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE l.lease_id = ?
      LIMIT 1
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [leaseId]);
    if (rows.length === 0) return null;

    const lease = rows[0];

    const signersSql = `
      SELECT ls.user_id AS userId, ls.signer_role AS signerRole, ls.signed_at AS signedAt,
             up.first_name AS firstName, up.last_name AS lastName, u.email
      FROM lease_signers ls
      JOIN users u ON ls.user_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE ls.lease_id = ?
    `;

    const [signers] = await db.execute<RowDataPacket[]>(signersSql, [leaseId]);

    return {
      ...lease,
      signers: signers as any,
    };
  }

  /**
   * List active/historical leases for a user
   */
  public async listUserLeases(
    userId: number,
    connection?: PoolConnection
  ): Promise<any[]> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        l.lease_id AS leaseId, l.unit_id AS unitId, l.start_date AS startDate, l.end_date AS endDate,
        l.monthly_base_rent AS monthlyBaseRent, l.status,
        u.unit_number AS unitNumber, p.property_name AS propertyName, p.street_address AS streetAddress
      FROM leases l
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      LEFT JOIN lease_signers ls ON l.lease_id = ls.lease_id
      WHERE ls.user_id = ? OR p.owner_id = ?
      GROUP BY l.lease_id
      ORDER BY l.start_date DESC
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [userId, userId]);
    return rows as any;
  }

  /**
   * Update lease status (State Machine Transition)
   */
  public async updateLeaseStatus(
    leaseId: number,
    status: "DRAFT" | "PENDING_SIGNATURE" | "ACTIVE" | "EXPIRED" | "TERMINATED",
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    await db.execute("UPDATE leases SET status = ? WHERE lease_id = ?", [status, leaseId]);
  }

  /**
   * Record lease signature
   */
  public async signLease(
    leaseId: number,
    userId: number,
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    await db.execute(
      "UPDATE lease_signers SET signed_at = NOW() WHERE lease_id = ? AND user_id = ?",
      [leaseId, userId]
    );
  }

  /**
   * Terminate lease via sp_CancelBooking
   */
  public async cancelLease(
    leaseId: number,
    reason: string,
    connection?: PoolConnection
  ): Promise<string> {
    const db = this.getDb(connection);
    await db.query<RowDataPacket[][]>("CALL sp_CancelBooking(?, ?, @out_status_message)", [
      leaseId,
      reason,
    ]);

    const [outRows] = await db.query<RowDataPacket[]>(
      "SELECT @out_status_message AS statusMessage"
    );

    return String(outRows[0]?.statusMessage || "");
  }
}
