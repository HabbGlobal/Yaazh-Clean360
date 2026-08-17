import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User";

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export function signToken(payload: TokenPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return jwt.verify(token, secret) as TokenPayload;
}
