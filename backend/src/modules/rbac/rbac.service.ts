import { RbacRepository } from "../../repositories/rbac.repository";
import { UserRepository } from "../../repositories/user.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { RoleRecord, PermissionRecord, RoleWithPermissions } from "../../types/rbac.types";
import { NotFoundError } from "../../utils/app-error";
import { withTransaction } from "../../utils/transaction.util";

export class RbacService {
  constructor(
    private rbacRepository: RbacRepository,
    private userRepository: UserRepository,
    private auditLogRepository: AuditLogRepository
  ) {}

  public async getRoles(): Promise<RoleRecord[]> {
    return this.rbacRepository.findAllRoles();
  }

  public async getRoleById(roleId: number): Promise<RoleWithPermissions> {
    const role = await this.rbacRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundError(`Role with ID ${roleId} does not exist.`);
    }
    return role;
  }

  public async getPermissions(): Promise<PermissionRecord[]> {
    return this.rbacRepository.findAllPermissions();
  }

  public async assignRoleToUser(
    userId: number,
    roleId: number,
    adminUserId: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    const user = await this.userRepository.findByIdWithDetails(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} does not exist.`);
    }

    const role = await this.rbacRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundError(`Role with ID ${roleId} does not exist.`);
    }

    await withTransaction(async (connection) => {
      await this.rbacRepository.assignRoleToUser(userId, roleId, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: adminUserId,
          actionType: "INSERT",
          targetTable: "user_roles",
          recordKey: `${userId}:${roleId}`,
          userAgent,
          ipAddress,
          postImageJson: { userId, roleId, roleName: role.roleName },
        },
        connection
      );
    });
  }

  public async revokeRoleFromUser(
    userId: number,
    roleId: number,
    adminUserId: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    await withTransaction(async (connection) => {
      await this.rbacRepository.revokeRoleFromUser(userId, roleId, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: adminUserId,
          actionType: "DELETE",
          targetTable: "user_roles",
          recordKey: `${userId}:${roleId}`,
          userAgent,
          ipAddress,
          postImageJson: { userId, roleId, action: "REVOKE" },
        },
        connection
      );
    });
  }

  public async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
    adminUserId: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    const role = await this.rbacRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundError(`Role with ID ${roleId} does not exist.`);
    }

    await withTransaction(async (connection) => {
      await this.rbacRepository.assignPermissionsToRole(roleId, permissionIds, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: adminUserId,
          actionType: "INSERT",
          targetTable: "role_permissions",
          recordKey: String(roleId),
          userAgent,
          ipAddress,
          postImageJson: { roleId, permissionIds },
        },
        connection
      );
    });
  }

  public async revokePermissionFromRole(
    roleId: number,
    permissionId: number,
    adminUserId: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    await withTransaction(async (connection) => {
      await this.rbacRepository.revokePermissionFromRole(roleId, permissionId, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: adminUserId,
          actionType: "DELETE",
          targetTable: "role_permissions",
          recordKey: `${roleId}:${permissionId}`,
          userAgent,
          ipAddress,
          postImageJson: { roleId, permissionId, action: "REVOKE" },
        },
        connection
      );
    });
  }
}
