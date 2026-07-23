import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/app-error";

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required for role guard."));
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      return next(
        new ForbiddenError(
          `User role '${req.user.roleName}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};

export const requirePermission = (requiredPermission: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required for permission guard."));
    }

    const userPermissions = req.user.permissions || [];
    if (!userPermissions.includes(requiredPermission)) {
      return next(
        new ForbiddenError(
          `User lacks required permission '${requiredPermission}'.`
        )
      );
    }

    next();
  };
};
