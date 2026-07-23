import winston from "winston";
import path from "path";
import { env } from "../config/env.config";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, correlationId, stack }) => {
    const correlation = correlationId ? ` [${correlationId}]` : "";
    const details = stack ? `\n${stack}` : "";
    return `${timestamp} ${level}${correlation}: ${message}${details}`;
  })
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: logFormat,
  defaultMeta: { service: "rentnest-backend" },
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === "development" ? consoleFormat : logFormat,
    }),
    new winston.transports.File({
      filename: path.resolve(process.cwd(), "logs/error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.resolve(process.cwd(), "logs/combined.log"),
    }),
  ],
});
