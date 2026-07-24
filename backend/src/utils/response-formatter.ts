import { Response } from "express";
import { ApiResponseEnvelope, PaginationMeta } from "../types/api.types";

export class ApiResponse {
  public static success<T>(
    res: Response,
    data?: T,
    message: string = "Request completed successfully",
    statusCode: number = 200
  ): Response {
    const payload: ApiResponseEnvelope<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(payload);
  }

  public static created<T>(
    res: Response,
    data?: T,
    message: string = "Resource created successfully"
  ): Response {
    return this.success(res, data, message, 201);
  }

  public static paginated<T>(
    res: Response,
    data: T[],
    meta: PaginationMeta,
    message: string = "Records retrieved successfully"
  ): Response {
    const payload: ApiResponseEnvelope<T[]> = {
      success: true,
      message,
      data,
      meta,
    };
    return res.status(200).json(payload);
  }

  public static failure(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 400,
    details?: any
  ): Response {
    const payload: ApiResponseEnvelope<null> = {
      success: false,
      message,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(statusCode).json(payload);
  }

  public static validationError(
    res: Response,
    errors: any[],
    message: string = "Request validation failed"
  ): Response {
    return this.failure(res, "VALIDATION_ERROR", message, 422, errors);
  }

  public static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
