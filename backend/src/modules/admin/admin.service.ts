import { AdminRepository } from "../../repositories/admin.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { UserRepository } from "../../repositories/user.repository";
import { generateAccessToken } from "../../utils/jwt.util";
import { NotFoundError } from "../../utils/app-error";
import { withTransaction } from "../../utils/transaction.util";

export class AdminService {
  constructor(
    private adminRepository: AdminRepository,
    private userRepository: UserRepository,
    private auditLogRepository: AuditLogRepository
  ) {}

  public async impersonateUser(
    adminUserId: number,
    targetUserId: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ impersonationToken: string; targetUser: any }> {
    const targetUser = await this.userRepository.findByIdWithDetails(targetUserId);
    if (!targetUser) {
      throw new NotFoundError(`Target user with ID ${targetUserId} does not exist.`);
    }

    return await withTransaction(async (connection) => {
      const impersonationToken = generateAccessToken({
        userId: targetUser.userId,
        email: targetUser.email,
        roleId: targetUser.roleId,
        roleName: targetUser.roleName || "ROLE_USER",
        permissions: targetUser.permissions || [],
      });

      await this.auditLogRepository.logAction(
        {
          actorUserId: adminUserId,
          actionType: "OVERRIDE",
          targetTable: "users",
          recordKey: String(targetUserId),
          userAgent,
          ipAddress,
          postImageJson: { impersonatedUserId: targetUserId, adminUserId },
        },
        connection
      );

      return {
        impersonationToken,
        targetUser: {
          userId: targetUser.userId,
          email: targetUser.email,
          roleId: targetUser.roleId,
        },
      };
    });
  }

  public async getAuditLogs(targetTable?: string, actionType?: string, limit?: number, offset?: number): Promise<any[]> {
    return this.adminRepository.getAuditLogs(targetTable, actionType, limit, offset);
  }

  public async globalSearch(query: string): Promise<any> {
    return this.adminRepository.globalSearch(query);
  }

  public async getSecurityDashboardMetrics(): Promise<any> {
    return this.adminRepository.getSecurityDashboardMetrics();
  }
}
