import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { UnauthorizedError } from "../utils/app-error";

export const authenticateToken = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.rentnest_access_token) {
    token = req.cookies.rentnest_access_token;
  }

  if (!token) {
    return next(new UnauthorizedError("Authentication token is missing."));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    req.token = token;
    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired authentication token."));
  }
};
