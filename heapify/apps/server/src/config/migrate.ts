import fs from "fs";
import path from "path";
import { pool } from "./database";
import { env } from "./env";

export const migrate = async () => {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
};

export const migrateOnStartup = async () => {
  // Auto-run in development; production should run migrations via CI/CD command.
  if (env.NODE_ENV !== "production") await migrate();
};

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
