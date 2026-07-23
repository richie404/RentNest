import { Router, Request, Response } from "express";
import { checkDatabaseConnection } from "../config/database.config";
import { ApiResponse } from "../utils/response-formatter";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

/**
 * GET /health
 * Overall system health check
 */
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const isDbConnected = await checkDatabaseConnection();

    const healthStatus = {
      status: isDbConnected ? "UP" : "DEGRADED",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        database: isDbConnected ? "HEALTHY" : "UNHEALTHY",
        application: "HEALTHY",
      },
    };

    const statusCode = isDbConnected ? 200 : 503;
    return ApiResponse.success(res, healthStatus, "System overall health status", statusCode);
  })
);

/**
 * GET /health/liveness
 * Kubernetes Liveness Probe
 */
router.get(
  "/liveness",
  asyncHandler(async (_req: Request, res: Response) => {
    return ApiResponse.success(res, { status: "ALIVE" }, "Container runtime process is alive.");
  })
);

/**
 * GET /health/readiness
 * Kubernetes Readiness Probe
 */
router.get(
  "/readiness",
  asyncHandler(async (_req: Request, res: Response) => {
    const isDbConnected = await checkDatabaseConnection();
    if (isDbConnected) {
      return ApiResponse.success(res, { status: "READY" }, "Container is ready to accept traffic.");
    } else {
      return ApiResponse.failure(res, "NOT_READY", "Database connection pending.", 503);
    }
  })
);

/**
 * GET /health/database
 * Direct database pool connectivity check
 */
router.get(
  "/database",
  asyncHandler(async (_req: Request, res: Response) => {
    const isDbConnected = await checkDatabaseConnection();
    if (isDbConnected) {
      return ApiResponse.success(
        res,
        { database: "CONNECTED", pool: "HEALTHY" },
        "Database pool connection is healthy."
      );
    } else {
      return ApiResponse.failure(
        res,
        "DATABASE_DISCONNECTED",
        "Database pool connection failed.",
        503
      );
    }
  })
);

/**
 * GET /health/application
 * Application process runtime check
 */
router.get("/application", (_req: Request, res: Response) => {
  const runtimeMetrics = {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    pid: process.pid,
  };

  return ApiResponse.success(res, runtimeMetrics, "Application runtime metrics.");
});

export default router;
