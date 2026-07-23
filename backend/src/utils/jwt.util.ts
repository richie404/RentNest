import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";
import { JwtPayload } from "../types/express";
import { UnauthorizedError } from "./app-error";

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function generateRefreshToken(payload: { userId: number }): string {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, jwtConfig.accessSecret) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired access token.");
  }
}

export function verifyRefreshToken(token: string): { userId: number } {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret) as { userId: number };
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired refresh token.");
  }
}
