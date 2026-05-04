import path from "path";
import dotenv from "dotenv";
import Joi from "joi";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const schema = Joi.object({
  PORT: Joi.number().default(5000),
  NODE_ENV: Joi.string().default("development"),
  FRONTEND_URL: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRES: Joi.string().default("7d"),
  SMTP_HOST: Joi.string().allow(""),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().allow(""),
  SMTP_PASS: Joi.string().allow(""),
}).unknown(true);

const { value, error } = schema.validate(process.env);
if (error) throw new Error(`Env validation error: ${error.message}`);

export const env = value as Record<string, string>;
