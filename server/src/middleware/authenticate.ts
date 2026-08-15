import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";

export interface AuthRequest extends Request { auth?: { userId: string; role: "resident" | "admin" }; }

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) throw new ApiError(401, "Authentication is required");
    const payload = verifyToken(token);
    const account = await User.findById(payload.userId).select("accountStatus");
    if (!account) throw new ApiError(401, "Account no longer exists");
    if (account.accountStatus === "suspended") throw new ApiError(403, "Your account has been suspended");
    req.auth = payload;
    next();
  } catch (error) { next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token")); }
}