export interface ImpersonateUserDTO {
  targetUserId: number;
}

export interface AuditLogFilterDTO {
  targetTable?: string;
  actionType?: string;
  limit?: number;
  offset?: number;
}
