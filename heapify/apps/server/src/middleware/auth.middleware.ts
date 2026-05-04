import { NextFunction, Request, Response } from "express";
import { verifyAccessJwt } from "../utils/jwt.utils";

export interface AuthRequest extends Request { user?: { id: string; role: string; institution_id: string } }

export const verifyAccessToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    req.user = verifyAccessJwt(token) as AuthRequest["user"];
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
