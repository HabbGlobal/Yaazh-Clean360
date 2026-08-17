import type { NextRequest } from "next/server";
import { ApiError } from "./utils/ApiError";
import { verifyToken, type TokenPayload } from "./utils/jwt";
import { User } from "./models/User";

export async function requireAuth(req: NextRequest, roles?: Array<"resident" | "admin">): Promise<TokenPayload> {
  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!token) throw new ApiError(401, "Authentication is required");
  let payload: TokenPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
  const account = await User.findById(payload.userId).select("accountStatus");
  if (!account) throw new ApiError(401, "Account no longer exists");
  if (account.accountStatus === "suspended") throw new ApiError(403, "Your account has been suspended");
  if (roles && !roles.includes(payload.role)) throw new ApiError(403, "You do not have permission for this action");
  return payload;
}
