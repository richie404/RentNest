import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../src/modules/users/user.service";
import { UserRepository } from "../src/repositories/user.repository";
import { AuditLogRepository } from "../src/repositories/audit-log.repository";
import { NotFoundError, ForbiddenError } from "../src/utils/app-error";

// Mock withTransaction
vi.mock("../src/utils/transaction.util", () => ({
  withTransaction: vi.fn((cb) => cb({})),
}));

describe("UserService Unit Tests", () => {
  let userService: UserService;
  let mockUserRepository: any;
  let mockAuditLogRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findPaginatedUsers: vi.fn(),
      findFullUserDetail: vi.fn(),
      updateProfile: vi.fn(),
      updateAccountStatus: vi.fn(),
    };

    mockAuditLogRepository = {
      logAction: vi.fn(),
    };

    userService = new UserService(
      mockUserRepository as UserRepository,
      mockAuditLogRepository as AuditLogRepository
    );
  });

  describe("getUsers", () => {
    it("should return paginated user results with meta info", async () => {
      mockUserRepository.findPaginatedUsers.mockResolvedValue({
        data: [{ userId: 1, email: "admin@test.com" }],
        total: 1,
      });

      const result = await userService.getUsers({ page: 1, limit: 10 });

      expect(result.data.length).toBe(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.hasNext).toBe(false);
    });
  });

  describe("getUserById", () => {
    it("should return user detail if found", async () => {
      mockUserRepository.findFullUserDetail.mockResolvedValue({ userId: 5, email: "user5@test.com" });

      const res = await userService.getUserById(5);
      expect(res.userId).toBe(5);
    });

    it("should throw NotFoundError if user missing", async () => {
      mockUserRepository.findFullUserDetail.mockResolvedValue(null);

      await expect(userService.getUserById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateProfile", () => {
    it("should throw ForbiddenError if user attempts to modify another profile without admin role", async () => {
      await expect(
        userService.updateProfile(10, 5, "ROLE_TENANT", { firstName: "Hacker" })
      ).rejects.toThrow(ForbiddenError);
    });

    it("should allow self update and record audit log", async () => {
      mockUserRepository.findFullUserDetail.mockResolvedValue({ userId: 5, profile: { firstName: "Old" } });

      await userService.updateProfile(5, 5, "ROLE_TENANT", { firstName: "New" });

      expect(mockUserRepository.updateProfile).toHaveBeenCalledWith(5, { firstName: "New" }, expect.anything());
      expect(mockAuditLogRepository.logAction).toHaveBeenCalled();
    });
  });
});
