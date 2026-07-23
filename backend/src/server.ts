import http from "http";
import { createApp } from "./app";
import { env } from "./config/env.config";
import { checkDatabaseConnection, dbPool } from "./config/database.config";
import { initSocketServer } from "./sockets/socket.server";
import { logger } from "./utils/logger";

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.IO Engine
initSocketServer(server);

// Start HTTP Server
server.listen(env.PORT, async () => {
  logger.info(`🚀 RentNest Express Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`🔗 API Base Endpoint: http://localhost:${env.PORT}${env.API_PREFIX}`);
  logger.info(`🏥 Health Check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);

  const dbConnected = await checkDatabaseConnection();
  if (dbConnected) {
    logger.info("✅ Connected to MySQL 8 (InnoDB Connection Pool Ready)");
  } else {
    logger.error("⚠️ Server started, but MySQL 8 database is unreachable.");
  }
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal: string) => {
  logger.info(`🛑 ${signal} signal received. Initiating graceful shutdown...`);

  server.close(async () => {
    logger.info("🔒 HTTP server closed.");

    try {
      await dbPool.end();
      logger.info("🔌 MySQL database pool drained and closed.");
      process.exit(0);
    } catch (err) {
      logger.error("Error closing MySQL database pool:", err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds if connections hang
  setTimeout(() => {
    logger.error("⚠️ Forced shutdown threshold reached. Exiting immediately.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason: any) => {
  logger.error("💥 Unhandled Rejection at Promise:", reason);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("💥 Uncaught Exception thrown:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});
