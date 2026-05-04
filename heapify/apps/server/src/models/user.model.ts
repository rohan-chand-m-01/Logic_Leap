import { pool } from "../config/database";

export interface UserRow {
  id: string; email: string; password_hash: string; role: "student" | "teacher" | "admin"; full_name: string; institution_id: string; registration_complete: boolean;
}

export const createInstitution = async (name: string, code: string, address?: string) => {
  const { rows } = await pool.query("INSERT INTO institutions(name, code, address) VALUES($1,$2,$3) RETURNING *", [name, code, address || null]);
  return rows[0];
};

export const createUser = async (data: Partial<UserRow> & { email: string; role: UserRow["role"]; full_name: string; institution_id: string; password_hash?: string }) => {
  const { rows } = await pool.query(
    "INSERT INTO users(email, password_hash, role, full_name, institution_id, registration_complete) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,email,role,full_name,institution_id,registration_complete",
    [data.email, data.password_hash || "pending", data.role, data.full_name, data.institution_id, data.registration_complete ?? false],
  );
  return rows[0];
};

export const getUserByEmail = async (email: string): Promise<UserRow | null> => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  return rows[0] || null;
};

export const getUserById = async (id: string) => {
  const { rows } = await pool.query("SELECT id,email,role,full_name,institution_id,registration_complete FROM users WHERE id=$1", [id]);
  return rows[0] || null;
};

export const completeUserRegistration = async (id: string, passwordHash: string) => {
  const { rows } = await pool.query("UPDATE users SET password_hash=$2, registration_complete=true, updated_at=NOW() WHERE id=$1 RETURNING id,email,role,full_name,institution_id,registration_complete", [id, passwordHash]);
  return rows[0];
};
