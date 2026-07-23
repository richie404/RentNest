import { Request, Response } from "express";
import { RbacService } from "./rbac.service";
import { ApiResponse } from "../../utils/response-formatter";

export class RbacController {
  constructor(private rbacService: RbacService) {}

  public getRoles = async (_req: Request, res: Response): Promise<Response> => {
    const roles = await this.rbacService.getRoles();
    return ApiResponse.success(res, roles, "Roles retrieved successfully.");
  };

  public getRoleById = async (req: Request, res: Response): Promise<Response> => {
    const roleId = parseInt(req.params.roleId, 10);
    const role = await this.rbacService.getRoleById(roleId);
    return ApiResponse.success(res, role, "Role details retrieved successfully.");
  };

  public getPermissions = async (_req: Request, res: Response): Promise<Response> => {
    const permissions = await this.rbacService.getPermissions();
    return ApiResponse.success(res, permissions, "Permissions retrieved successfully.");
  };

  public assignRoleToUser = async (req: Request, res: Response): Promise<Response> => {
    const userId = parseInt(req.params.userId, 10);
    const { roleId } = req.body;
    const adminUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    await this.rbacService.assignRoleToUser(userId, roleId, adminUserId, userAgent, ipAddress);
    return ApiResponse.success(res, null, "Role assigned to user successfully.");
  };

  public revokeRoleFromUser = async (req: Request, res: Response): Promise<Response> => {
    const userId = parseInt(req.params.userId, 10);
    const roleId = parseInt(req.params.roleId, 10);
    const adminUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    await this.rbacService.revokeRoleFromUser(userId, roleId, adminUserId, userAgent, ipAddress);
    return ApiResponse.success(res, null, "Role revoked from user successfully.");
  };

  public assignPermissionsToRole = async (req: Request, res: Response): Promise<Response> => {
    const roleId = parseInt(req.params.roleId, 10);
    const { permissionIds } = req.body;
    const adminUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    await this.rbacService.assignPermissionsToRole(
      roleId,
      permissionIds,
      adminUserId,
      userAgent,
      ipAddress
    );
    return ApiResponse.success(res, null, "Permissions assigned to role successfully.");
  };

  public revokePermissionFromRole = async (req: Request, res: Response): Promise<Response> => {
    const roleId = parseInt(req.params.roleId, 10);
    const permissionId = parseInt(req.params.permissionId, 10);
    const adminUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    await this.rbacService.revokePermissionFromRole(
      roleId,
      permissionId,
      adminUserId,
      userAgent,
      ipAddress
    );
    return ApiResponse.success(res, null, "Permission revoked from role successfully.");
  };
}
