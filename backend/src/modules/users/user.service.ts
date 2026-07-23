import { UserRepository } from "../../repositories/user.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { SessionRepository } from "../../repositories/session.repository";
import { UserFilterOptions, UserDetailData, UpdateProfileDTO } from "../../types/user.types";
import { NotFoundError, ForbiddenError } from "../../utils/app-error";
import { hashPassword } from "../../utils/password.util";
import { withTransaction } from "../../utils/transaction.util";

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private auditLogRepository: AuditLogRepository,
    private sessionRepository: SessionRepository = new SessionRepository()
  ) {}

  public async getUsers(options: UserFilterOptions): Promise<{ data: UserDetailData[]; meta: any }> {
    const { data, total } = await this.userRepository.findPaginatedUsers(options);
    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  public async getUserById(userId: number): Promise<UserDetailData> {
    const user = await this.userRepository.findFullUserDetail(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} does not exist.`);
    }
    return user;
  }

  public async updateProfile(
    targetUserId: number,
    requestorUserId: number,
    requestorRole: string,
    dto: UpdateProfileDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<UserDetailData> {
    if (targetUserId !== requestorUserId && requestorRole !== "ROLE_ADMIN") {
      throw new ForbiddenError("You are not authorized to modify another user's profile.");
    }

    const existingUser = await this.userRepository.findFullUserDetail(targetUserId);
    if (!existingUser) {
      throw new NotFoundError(`User with ID ${targetUserId} does not exist.`);
    }

    return await withTransaction(async (connection) => {
      await this.userRepository.updateProfile(targetUserId, dto, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: requestorUserId,
          actionType: "UPDATE",
          targetTable: "user_profiles",
          recordKey: String(targetUserId),
          userAgent,
          ipAddress,
          preImageJson: existingUser.profile,
          postImageJson: dto,
        },
        connection
      );

      const updatedUser = await this.userRepository.findFullUserDetail(targetUserId, connection);
      return updatedUser!;
    });
  }

  public async updateStatus(
    targetUserId: number,
    adminUserId: number,
    status: "ACTIVE" | "SUSPENDED" | "UNVERIFIED",
    userAgent?: string,
    ipAddress?: string
  ): Promise<UserDetailData> {
    const existingUser = await this.userRepository.findFullUserDetail(targetUserId);
    if (!existingUser) {
      throw new NotFoundError(`User with ID ${targetUserId} does not exist.`);
    }

    return await withTransaction(async (connection) => {
      await this.userRepository.updateAccountStatus(targetUserId, status, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: adminUserId,
          actionType: "OVERRIDE",
          targetTable: "users",
          recordKey: String(targetUserId),
          userAgent,
          ipAddress,
          preImageJson: { accountStatus: existingUser.accountStatus },
          postImageJson: { accountStatus: status },
        },
        connection
      );

      const updatedUser = await this.userRepository.findFullUserDetail(targetUserId, connection);
      return updatedUser!;
    });
  }

  public async adminResetPassword(
    targetUserId: number,
    adminUserId: number,
    newPassword: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    const existingUser = await this.userRepository.findFullUserDetail(targetUserId);
    if (!existingUser) {
      throw new NotFoundError(`User with ID ${targetUserId} does not exist.`);
    }

    const hashedPassword = await hashPassword(newPassword);

    await withTransaction(async (connection) => {
      await this.userRepository.updatePassword(targetUserId, hashedPassword, connection);
      await this.sessionRepository.revokeAllUserSessions(targetUserId, connection);

      await this.auditLogRepository.logAction(
        {
          actorUserId: adminUserId,
          actionType: "OVERRIDE",
          targetTable: "users",
          recordKey: String(targetUserId),
          userAgent,
          ipAddress,
          postImageJson: { action: "ADMIN_PASSWORD_RESET" },
        },
        connection
      );
    });
  }

  public async adminForceLogout(
    targetUserId: number,
    adminUserId: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    const existingUser = await this.userRepository.findFullUserDetail(targetUserId);
    if (!existingUser) {
      throw new NotFoundError(`User with ID ${targetUserId} does not exist.`);
    }

    await this.sessionRepository.revokeAllUserSessions(targetUserId);
    await this.auditLogRepository.logAction({
      actorUserId: adminUserId,
      actionType: "OVERRIDE",
      targetTable: "user_sessions",
      recordKey: String(targetUserId),
      userAgent,
      ipAddress,
      postImageJson: { action: "FORCE_LOGOUT" },
    });
  }

  public async getUserAuditHistory(targetUserId: number): Promise<any[]> {
    return this.auditLogRepository.getAuditLogsForUser(targetUserId);
  }
}
