import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../config/database.config";

export interface CreateMaintenanceRequestDTO {
  unitId: number;
  issueCategory: string;
  priorityLevel?: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  permissionToEnter?: boolean;
  description: string;
}

export interface AssignVendorDTO {
  vendorId: number;
}

export interface UpdateMaintenanceStatusDTO {
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  note?: string;
}

export class MaintenanceRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Create maintenance request
   */
  public async createRequest(
    reporterUserId: number,
    dto: CreateMaintenanceRequestDTO,
    connection?: PoolConnection
  ): Promise<number> {
    const db = this.getDb(connection);
    const sql = `
      INSERT INTO maintenance_requests (
        unit_id, reporter_user_id, issue_category, priority_level, permission_to_enter, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'OPEN')
    `;

    const [result] = await db.execute<ResultSetHeader>(sql, [
      dto.unitId,
      reporterUserId,
      dto.issueCategory,
      dto.priorityLevel || "MEDIUM",
      dto.permissionToEnter !== undefined ? dto.permissionToEnter : true,
      dto.description,
    ]);

    return result.insertId;
  }

  /**
   * Assign vendor via sp_AssignMaintenanceRequest
   */
  public async assignVendor(
    requestId: number,
    vendorId: number,
    managerUserId: number,
    connection?: PoolConnection
  ): Promise<string> {
    const db = this.getDb(connection);
    await db.query<RowDataPacket[][]>(
      "CALL sp_AssignMaintenanceRequest(?, ?, ?, @out_status_message)",
      [requestId, vendorId, managerUserId]
    );

    const [outRows] = await db.query<RowDataPacket[]>(
      "SELECT @out_status_message AS statusMessage"
    );

    return String(outRows[0]?.statusMessage || "");
  }

  /**
   * Update request status and log timeline update note
   */
  public async updateStatus(
    requestId: number,
    userId: number,
    status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
    note?: string,
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    await db.execute("UPDATE maintenance_requests SET status = ? WHERE request_id = ?", [
      status,
      requestId,
    ]);

    await db.execute(
      "INSERT INTO maintenance_updates (request_id, user_id, update_note, status_changed_to) VALUES (?, ?, ?, ?)",
      [requestId, userId, note || `Status updated to ${status}`, status]
    );
  }

  /**
   * Find request by ID with timeline updates
   */
  public async findRequestById(
    requestId: number,
    connection?: PoolConnection
  ): Promise<any | null> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        mr.request_id AS requestId, mr.unit_id AS unitId, mr.reporter_user_id AS reporterUserId,
        mr.assigned_vendor_id AS assignedVendorId, mr.issue_category AS issueCategory,
        mr.priority_level AS priorityLevel, mr.permission_to_enter AS permissionToEnter,
        mr.description, mr.status, mr.created_at AS createdAt,
        u.unit_number AS unitNumber, p.property_name AS propertyName, p.property_id AS propertyId, p.owner_id AS ownerId,
        v.company_name AS vendorCompanyName, v.trade_specialty AS vendorTradeSpecialty
      FROM maintenance_requests mr
      JOIN units u ON mr.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      LEFT JOIN vendors v ON mr.assigned_vendor_id = v.vendor_id
      WHERE mr.request_id = ?
      LIMIT 1
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [requestId]);
    if (rows.length === 0) return null;

    const request = rows[0];

    const updatesSql = `
      SELECT mu.update_id AS updateId, mu.user_id AS userId, mu.update_note AS updateNote,
             mu.status_changed_to AS statusChangedTo, mu.created_at AS createdAt,
             up.first_name AS firstName, up.last_name AS lastName
      FROM maintenance_updates mu
      LEFT JOIN user_profiles up ON mu.user_id = up.user_id
      WHERE mu.request_id = ?
      ORDER BY mu.created_at ASC
    `;

    const [updates] = await db.execute<RowDataPacket[]>(updatesSql, [requestId]);

    return {
      ...request,
      updates: updates as any,
    };
  }

  /**
   * List maintenance requests for user/vendor/owner
   */
  public async listRequests(
    userId: number,
    roleName: string,
    connection?: PoolConnection
  ): Promise<any[]> {
    const db = this.getDb(connection);
    let sql = `
      SELECT 
        mr.request_id AS requestId, mr.unit_id AS unitId, mr.issue_category AS issueCategory,
        mr.priority_level AS priorityLevel, mr.status, mr.created_at AS createdAt,
        u.unit_number AS unitNumber, p.property_name AS propertyName
      FROM maintenance_requests mr
      JOIN units u ON mr.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
    `;

    if (roleName === "ROLE_PROPERTY_OWNER") {
      sql += " WHERE p.owner_id = ? ORDER BY mr.created_at DESC";
    } else if (roleName === "ROLE_VENDOR") {
      sql += " JOIN vendors v ON mr.assigned_vendor_id = v.vendor_id WHERE v.user_id = ? ORDER BY mr.created_at DESC";
    } else {
      sql += " WHERE mr.reporter_user_id = ? ORDER BY mr.created_at DESC";
    }

    const [rows] = await db.execute<RowDataPacket[]>(sql, [userId]);
    return rows as any;
  }

  /**
   * Query dispatch summary from vw_maintenance_summary_dispatch
   */
  public async getDispatchSummary(connection?: PoolConnection): Promise<any[]> {
    const db = this.getDb(connection);
    const sql = `SELECT * FROM vw_maintenance_summary_dispatch ORDER BY priority_level DESC, created_at ASC`;
    const [rows] = await db.execute<RowDataPacket[]>(sql);
    return rows as any;
  }
}
