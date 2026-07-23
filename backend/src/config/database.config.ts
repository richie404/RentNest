import mysql from "mysql2/promise";
import { env } from "./env.config";

export const dbPool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: "+00:00",
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await dbPool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ MySQL 8 Database Connection Failed:", error);
    return false;
  }
}
