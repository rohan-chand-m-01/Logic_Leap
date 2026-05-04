import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { success } from "../utils/response.utils";
import { AuthRequest } from "../middleware/auth.middleware";

export const registerAdmin = async (req: Request, res: Response) => success(res, await authService.registerFirstAdmin(req.body), 201);
export const registerBulk = async (req: AuthRequest, res: Response) => success(res, await authService.bulkRegisterUsers(req.body.users, req.user!.id), 201);
export const completeRegistration = async (req: Request, res: Response) => success(res, await authService.completeRegistration(req.body.token, req.body.password));

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.cookie("refreshToken", result.refreshToken, { httpOnly: true, sameSite: "lax" });
  success(res, { accessToken: result.accessToken, user: result.user });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  const accessToken = await authService.refreshAccessToken(refreshToken);
  success(res, { accessToken });
};

export const logout = async (req: AuthRequest, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  await authService.logout(req.user!.id, refreshToken);
  res.clearCookie("refreshToken");
  success(res, { loggedOut: true });
};

export const me = async (req: AuthRequest, res: Response) => success(res, req.user);
