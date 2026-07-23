import { Request } from "express";

export interface JwtPayload {
  userId: number;
  email: string;
  roleId: number;
  roleName: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      user?: JwtPayload;
      token?: string;
    }
  }
}
