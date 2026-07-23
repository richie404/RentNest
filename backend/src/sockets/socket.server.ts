import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { corsOptions } from "../config/cors.config";
import { logger } from "../utils/logger";
import { verifyAccessToken } from "../utils/jwt.util";

export let io: Server;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: corsOptions,
    transports: ["websocket", "polling"],
  });

  // JWT Handshake Middleware
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication token required for Socket connection."));
      }

      const decoded = verifyAccessToken(token);
      socket.data.user = decoded;
      next();
    } catch (err: any) {
      next(new Error(`Socket authentication failed: ${err.message}`));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    logger.info(`🔌 Socket client connected: ${socket.id} (User: ${user?.userId || "Guest"})`);

    if (user?.userId) {
      const userRoom = `user:${user.userId}`;
      socket.join(userRoom);
      logger.info(`👤 Socket ${socket.id} joined personal room '${userRoom}'`);
    }

    socket.on("disconnect", (reason) => {
      logger.info(`🔌 Socket client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  return io;
}
