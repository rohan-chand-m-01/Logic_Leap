import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({ connectionString: env.DATABASE_URL });
export const connectDatabase = async () => {
  await pool.query("SELECT 1");
};

export const withTransaction = async <T>(callback: (client: any) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
