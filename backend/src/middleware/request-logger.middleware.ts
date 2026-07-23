import morgan, { StreamOptions } from "morgan";
import { Request } from "express";
import { logger } from "../utils/logger";

const stream: StreamOptions = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

morgan.token("correlation-id", (req: Request) => req.correlationId || "-");

export const requestLoggerMiddleware = morgan(
  ":remote-addr - :method :url :status :res[content-length] - :response-time ms [CID: :correlation-id]",
  { stream }
);
