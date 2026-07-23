import { describe, it, expect, vi, beforeEach } from "vitest";
import { RbacService } from "../src/modules/rbac/rbac.service";
import { RbacRepository } from "../src/repositories/rbac.repository";
import { UserRepository } from "../src/repositories/user.repository";
import { AuditLogRepository } from "../src/repositories/audit-log.repository";
import { NotFoundError } from "../src/utils/app-error";

vi.mock("../src/utils/transaction.util", () => ({
  withTransaction: vi.fn((cb) => cb({})),
}));

describe("RbacService Unit Tests", () => {
  let rbacService: RbacService;
  let mockRbacRepository: any;
  let mockUserRepository: any;
  let mockAuditLogRepository: any;

  beforeEach(() => {
    mockRbacRepository = {
      findAllRoles: vi.fn(),
      findRoleById: vi.fn(),
      findAllPermissions: vi.fn(),
      assignRoleToUser: vi.fn(),
      revokeRoleFromUser: vi.fn(),
      assignPermissionsToRole: vi.fn(),
      revokePermissionFromRole: vi.fn(),
    };

    mockUserRepository = {
      findByIdWithDetails: vi.fn(),
    };

    mockAuditLogRepository = {
      logAction: vi.fn(),
    };

    rbacService = new RbacService(
      mockRbacRepository as RbacRepository,
      mockUserRepository as UserRepository,
      mockAuditLogRepository as AuditLogRepository
    );
  });

  describe("assignRoleToUser", () => {
    it("should throw NotFoundError if user does not exist", async () => {
      mockUserRepository.findByIdWithDetails.mockResolvedValue(null);

      await expect(rbacService.assignRoleToUser(999, 1, 1)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if role does not exist", async () => {
      mockUserRepository.findByIdWithDetails.mockResolvedValue({ userId: 10 });
      mockRbacRepository.findRoleById.mockResolvedValue(null);

      await expect(rbacService.assignRoleToUser(10, 999, 1)).rejects.toThrow(NotFoundError);
    });

    it("should assign role to user and create audit log", async () => {
      mockUserRepository.findByIdWithDetails.mockResolvedValue({ userId: 10 });
      mockRbacRepository.findRoleById.mockResolvedValue({ roleId: 2, roleName: "ROLE_VENDOR" });

      await rbacService.assignRoleToUser(10, 2, 1);

      expect(mockRbacRepository.assignRoleToUser).toHaveBeenCalledWith(10, 2, expect.anything());
      expect(mockAuditLogRepository.logAction).toHaveBeenCalled();
    });
  });
});
