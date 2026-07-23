import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../config/database.config";
import { UserRecord, UserWithRoleAndPermissions, RegisterDTO } from "../types/auth.types";
import { UserFilterOptions, UserDetailData, UpdateProfileDTO } from "../types/user.types";

export class UserRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Register a user using stored procedure sp_RegisterUser
   */
  public async registerUser(
    dto: RegisterDTO,
    passwordHash: string,
    connection?: PoolConnection
  ): Promise<{ userId: number; statusMessage: string }> {
    const db = this.getDb(connection);
    
    const [results] = await db.query<RowDataPacket[][]>(
      "CALL sp_RegisterUser(?, ?, ?, ?, ?, ?, ?, @out_user_id, @out_status_message)",
      [
        dto.email,
        passwordHash,
        dto.phoneNumber || null,
        dto.roleName,
        dto.firstName,
        dto.lastName,
        dto.dateOfBirth || null,
      ]
    );

    const [outRows] = await db.query<RowDataPacket[]>(
      "SELECT @out_user_id AS userId, @out_status_message AS statusMessage"
    );

    const userId = Number(outRows[0]?.userId || 0);
    const statusMessage = String(outRows[0]?.statusMessage || "");

    return { userId, statusMessage };
  }

  /**
   * Find user by email with details, role and permissions
   */
  public async findByEmailWithDetails(
    email: string,
    connection?: PoolConnection
  ): Promise<UserWithRoleAndPermissions | null> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        u.user_id AS userId,
        u.email,
        u.password_hash AS passwordHash,
        u.phone_number AS phoneNumber,
        u.account_status AS accountStatus,
        r.role_id AS roleId,
        r.role_name AS roleName,
        up.first_name AS firstName,
        up.last_name AS lastName,
        GROUP_CONCAT(p.permission_code) AS permissionsStr
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE u.email = ?
      GROUP BY u.user_id, r.role_id, up.profile_id
      LIMIT 1
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [email]);
    if (rows.length === 0) return null;

    const row = rows[0];
    const permissions = row.permissionsStr ? row.permissionsStr.split(",") : [];

    return {
      userId: row.userId,
      email: row.email,
      passwordHash: row.passwordHash,
      phoneNumber: row.phoneNumber,
      accountStatus: row.accountStatus,
      roleId: row.roleId,
      roleName: row.roleName,
      firstName: row.firstName,
      lastName: row.lastName,
      permissions,
    };
  }

  /**
   * Find user by ID with details, role and permissions
   */
  public async findByIdWithDetails(
    userId: number,
    connection?: PoolConnection
  ): Promise<UserWithRoleAndPermissions | null> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        u.user_id AS userId,
        u.email,
        u.password_hash AS passwordHash,
        u.phone_number AS phoneNumber,
        u.account_status AS accountStatus,
        r.role_id AS roleId,
        r.role_name AS roleName,
        up.first_name AS firstName,
        up.last_name AS lastName,
        GROUP_CONCAT(p.permission_code) AS permissionsStr
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE u.user_id = ?
      GROUP BY u.user_id, r.role_id, up.profile_id
      LIMIT 1
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [userId]);
    if (rows.length === 0) return null;

    const row = rows[0];
    const permissions = row.permissionsStr ? row.permissionsStr.split(",") : [];

    return {
      userId: row.userId,
      email: row.email,
      passwordHash: row.passwordHash,
      phoneNumber: row.phoneNumber,
      accountStatus: row.accountStatus,
      roleId: row.roleId,
      roleName: row.roleName,
      firstName: row.firstName,
      lastName: row.lastName,
      permissions,
    };
  }

  /**
   * Fetch full user detail by ID
   */
  public async findFullUserDetail(
    userId: number,
    connection?: PoolConnection
  ): Promise<UserDetailData | null> {
    const db = this.getDb(connection);
    
    // Fetch core user & profile
    const userSql = `
      SELECT 
        u.user_id AS userId, u.email, u.phone_number AS phoneNumber,
        u.account_status AS accountStatus, u.created_at AS createdAt, u.updated_at AS updatedAt,
        up.profile_id AS profileId, up.first_name AS firstName, up.last_name AS lastName,
        up.date_of_birth AS dateOfBirth, up.avatar_url AS avatarUrl, up.emergency_contact_json AS emergencyContactJson
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE u.user_id = ?
      LIMIT 1
    `;
    const [rows] = await db.execute<RowDataPacket[]>(userSql, [userId]);
    if (rows.length === 0) return null;

    const r = rows[0];

    // Fetch user roles
    const rolesSql = `
      SELECT r.role_id AS roleId, r.role_name AS roleName, r.description
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = ?
    `;
    const [roles] = await db.execute<RowDataPacket[]>(rolesSql, [userId]);

    return {
      userId: r.userId,
      email: r.email,
      phoneNumber: r.phoneNumber,
      accountStatus: r.accountStatus,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      profile: r.profileId
        ? {
            profileId: r.profileId,
            firstName: r.firstName,
            lastName: r.lastName,
            dateOfBirth: r.dateOfBirth,
            avatarUrl: r.avatarUrl,
            emergencyContactJson: typeof r.emergencyContactJson === "string" ? JSON.parse(r.emergencyContactJson) : r.emergencyContactJson,
          }
        : null,
      roles: roles as any,
    };
  }

  /**
   * List paginated users with filters
   */
  public async findPaginatedUsers(
    options: UserFilterOptions,
    connection?: PoolConnection
  ): Promise<{ data: UserDetailData[]; total: number }> {
    const db = this.getDb(connection);
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (options.accountStatus) {
      whereClauses.push("u.account_status = ?");
      params.push(options.accountStatus);
    }

    if (options.roleName) {
      whereClauses.push("r.role_name = ?");
      params.push(options.roleName);
    }

    if (options.search) {
      whereClauses.push("(u.email LIKE ? OR up.first_name LIKE ? OR up.last_name LIKE ?)");
      const term = `%${options.search}%`;
      params.push(term, term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countSql = `
      SELECT COUNT(DISTINCT u.user_id) AS total
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      ${whereSql}
    `;

    const [countRows] = await db.execute<RowDataPacket[]>(countSql, params);
    const total = Number(countRows[0]?.total || 0);

    const idsSql = `
      SELECT DISTINCT u.user_id
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      ${whereSql}
      ORDER BY u.user_id DESC
      LIMIT ? OFFSET ?
    `;

    const [idRows] = await db.execute<RowDataPacket[]>(idsSql, [...params, String(limit), String(offset)]);
    const userIds = idRows.map((r) => r.user_id);

    if (userIds.length === 0) {
      return { data: [], total };
    }

    const details: UserDetailData[] = [];
    for (const id of userIds) {
      const detail = await this.findFullUserDetail(id, connection);
      if (detail) details.push(detail);
    }

    return { data: details, total };
  }

  /**
   * Update user profile details
   */
  public async updateProfile(
    userId: number,
    dto: UpdateProfileDTO,
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    const updates: string[] = [];
    const params: any[] = [];

    if (dto.firstName !== undefined) {
      updates.push("first_name = ?");
      params.push(dto.firstName);
    }

    if (dto.lastName !== undefined) {
      updates.push("last_name = ?");
      params.push(dto.lastName);
    }

    if (dto.dateOfBirth !== undefined) {
      updates.push("date_of_birth = ?");
      params.push(dto.dateOfBirth || null);
    }

    if (dto.avatarUrl !== undefined) {
      updates.push("avatar_url = ?");
      params.push(dto.avatarUrl || null);
    }

    if (dto.emergencyContactJson !== undefined) {
      updates.push("emergency_contact_json = ?");
      params.push(dto.emergencyContactJson ? JSON.stringify(dto.emergencyContactJson) : null);
    }

    if (updates.length === 0) return;

    params.push(userId);
    const sql = `UPDATE user_profiles SET ${updates.join(", ")} WHERE user_id = ?`;
    await db.execute(sql, params);
  }

  /**
   * Update account status
   */
  public async updateAccountStatus(
    userId: number,
    status: "ACTIVE" | "SUSPENDED" | "UNVERIFIED",
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    await db.execute("UPDATE users SET account_status = ? WHERE user_id = ?", [status, userId]);
  }

  /**
   * Update password hash for user
   */
  public async updatePassword(
    userId: number,
    passwordHash: string,
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    await db.execute("UPDATE users SET password_hash = ? WHERE user_id = ?", [passwordHash, userId]);
  }
}
