import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default("http://localhost:8080/api/v1"),
  VITE_WS_URL: z.string().default("ws://localhost:8080/ws"),
  VITE_APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  VITE_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
});

const _env = envSchema.safeParse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_WS_URL: import.meta.env.VITE_WS_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
});

if (!_env.success) {
  console.error("Invalid environment variables configuration:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
