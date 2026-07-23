import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../config/database.config";
import { RoleRecord, PermissionRecord, RoleWithPermissions } from "../types/rbac.types";

export class RbacRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Fetch all system roles
   */
  public async findAllRoles(connection?: PoolConnection): Promise<RoleRecord[]> {
    const db = this.getDb(connection);
    const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM roles ORDER BY role_id ASC");
    return rows as RoleRecord[];
  }

  /**
   * Find role by ID
   */
  public async findRoleById(
    roleId: number,
    connection?: PoolConnection
  ): Promise<RoleWithPermissions | null> {
    const db = this.getDb(connection);
    const roleSql = "SELECT * FROM roles WHERE role_id = ? LIMIT 1";
    const [roleRows] = await db.execute<RowDataPacket[]>(roleSql, [roleId]);

    if (roleRows.length === 0) return null;
    const role = roleRows[0];

    const permSql = `
      SELECT p.permission_id AS permissionId, p.permission_code AS permissionCode, p.description
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE rp.role_id = ?
    `;
    const [permRows] = await db.execute<RowDataPacket[]>(permSql, [roleId]);

    return {
      roleId: role.role_id,
      roleName: role.role_name,
      description: role.description,
      permissions: permRows as any,
    };
  }

  /**
   * Fetch all permissions
   */
  public async findAllPermissions(connection?: PoolConnection): Promise<PermissionRecord[]> {
    const db = this.getDb(connection);
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM permissions ORDER BY permission_code ASC"
    );
    return rows as PermissionRecord[];
  }

  /**
   * Assign a role to a user
   */
  public async assignRoleToUser(
    userId: number,
    roleId: number,
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    const sql = `
      INSERT INTO user_roles (user_id, role_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP
    `;
    await db.execute(sql, [userId, roleId]);
  }

  /**
   * Revoke a role from a user
   */
  public async revokeRoleFromUser(
    userId: number,
    roleId: number,
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    await db.execute("DELETE FROM user_roles WHERE user_id = ? AND role_id = ?", [
      userId,
      roleId,
    ]);
  }

  /**
   * Assign permissions to a role
   */
  public async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    for (const permId of permissionIds) {
      await db.execute(
        "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [roleId, permId]
      );
    }
  }

  /**
   * Revoke a permission from a role
   */
  public async revokePermissionFromRole(
    roleId: number,
    permissionId: number,
    connection?: PoolConnection
  ): Promise<void> {
    const db = this.getDb(connection);
    await db.execute("DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?", [
      roleId,
      permissionId,
    ]);
  }

  /**
   * Fetch permissions assigned to a specific user
   */
  public async findPermissionsByUserId(
    userId: number,
    connection?: PoolConnection
  ): Promise<string[]> {
    const db = this.getDb(connection);
    const sql = `
      SELECT DISTINCT p.permission_code
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE ur.user_id = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [userId]);
    return rows.map((r) => r.permission_code);
  }
}
