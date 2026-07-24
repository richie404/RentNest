import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env.config";
import { corsOptions } from "./config/cors.config";
import { correlationMiddleware } from "./middleware/correlation.middleware";
import { requestLoggerMiddleware } from "./middleware/request-logger.middleware";
import { globalRateLimiter } from "./middleware/rate-limiter.middleware";
import { globalErrorHandler } from "./middleware/error.middleware";
import { NotFoundError } from "./utils/app-error";
import apiV1Router from "./routes";
import { swaggerUiHtmlHandler } from "./routes/docs.routes";

export const createApp = (): Application => {
  const app: Application = express();

  // Trust proxy for rate limiting behind reverse proxies (Nginx / Cloudflare)
  app.set("trust proxy", 1);

  // Security HTTP Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Allow Swagger UI inline scripts & CDN stylesheets
  }));

  // CORS Setup
  app.use(cors(corsOptions));

  // Gzip / Brotli Compression
  app.use(compression());

  // Cookie Parser
  app.use(cookieParser());

  // Body Parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Correlation IDs & Logging
  app.use(correlationMiddleware);
  app.use(requestLoggerMiddleware);

  // Rate Limiting
  app.use(globalRateLimiter);

  // Serve Uploaded Files
  app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_PATH)));

  // Interactive Swagger UI Web Documentation
  app.get("/api/docs", swaggerUiHtmlHandler);
  app.get("/docs", swaggerUiHtmlHandler);

  // Mount API v1 Master Router
  app.use(env.API_PREFIX, apiV1Router);

  // 404 Route Handler
  app.use("*", (req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route '${req.originalUrl}' does not exist on this server.`));
  });

  // Global Exception Middleware
  app.use(globalErrorHandler);

  return app;
};
