import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { logger } from "../utils/logger";
import { env } from "../config/env.config";
import { ApiErrorEnvelope, ApiResponseEnvelope } from "../types/api.types";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
  let message = err.message || "An unexpected error occurred.";
  let details = err.details || null;

  // MySQL 8 Error Code Mapping
  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    errorCode = "DUPLICATE_ENTRY";
    message = "A record with matching unique constraints already exists.";
  } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    errorCode = "FOREIGN_KEY_VIOLATION";
    message = "Referenced parent entity does not exist.";
  }

  const errorEnvelope: ApiErrorEnvelope = {
    code: errorCode,
    message,
    details: env.NODE_ENV === "development" ? details || err.stack : details,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    correlationId: req.correlationId,
  };

  const responsePayload: ApiResponseEnvelope = {
    success: false,
    error: errorEnvelope,
  };

  if (statusCode >= 500) {
    logger.error(`[${req.correlationId || "SYS"}] ${req.method} ${req.originalUrl} - ${message}`, {
      stack: err.stack,
      correlationId: req.correlationId,
    });
  } else {
    logger.warn(`[${req.correlationId || "SYS"}] ${req.method} ${req.originalUrl} - ${statusCode} ${message}`);
  }

  return res.status(statusCode).json(responsePayload);
};
