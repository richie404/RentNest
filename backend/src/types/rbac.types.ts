export interface RoleRecord {
  role_id: number;
  role_name: string;
  description: string | null;
  created_at: Date;
}

export interface PermissionRecord {
  permission_id: number;
  permission_code: string;
  description: string | null;
  created_at: Date;
}

export interface RoleWithPermissions {
  roleId: number;
  roleName: string;
  description: string | null;
  permissions: {
    permissionId: number;
    permissionCode: string;
    description: string | null;
  }[];
}

export interface AssignRoleDTO {
  roleId: number;
}

export interface AssignPermissionsDTO {
  permissionIds: number[];
}
