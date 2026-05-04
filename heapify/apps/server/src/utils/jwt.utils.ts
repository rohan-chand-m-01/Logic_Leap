import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const signAccessToken = (payload: object) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions["expiresIn"] });
export const signRefreshToken = (payload: object) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions["expiresIn"] });
export const verifyAccessJwt = (token: string) => jwt.verify(token, env.JWT_SECRET);
export const verifyRefreshJwt = (token: string) => jwt.verify(token, env.JWT_REFRESH_SECRET);
