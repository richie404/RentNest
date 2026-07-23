import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform((val) => parseInt(val, 10)).default("5000"),
  API_PREFIX: z.string().default("/api/v1"),

  // Database
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().transform((val) => parseInt(val, 10)).default("3306"),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default("root"),
  DB_NAME: z.string().default("rentnest_db"),
  DB_CONNECTION_LIMIT: z.string().transform((val) => parseInt(val, 10)).default("20"),

  // Authentication
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // Uploads
  UPLOAD_PATH: z.string().default("./uploads"),
  MAX_FILE_SIZE_MB: z.string().transform((val) => parseInt(val, 10)).default("10"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables configuration:", parsedEnv.error.format());
  throw new Error("Invalid environment configuration.");
}

export const env = parsedEnv.data;
