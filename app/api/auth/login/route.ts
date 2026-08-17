import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/server/models/User";
import { ApiError } from "@/server/utils/ApiError";
import { signToken } from "@/server/utils/jwt";
import { handle, parseBody } from "@/server/handler";
import { loginSchema } from "@/server/validators/authValidator";
import { safeUser } from "@/server/safeUser";

export const POST = handle(async (req: NextRequest) => {
  const body = await parseBody(req, loginSchema);
  const email = String(body.email).trim().toLowerCase();
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(body.password, user.password))) throw new ApiError(401, "Invalid email or password");
  if (!user.emailVerified) throw new ApiError(403, "Verify your email before signing in");
  if (user.accountStatus === "suspended") throw new ApiError(403, "This account is suspended");
  return NextResponse.json({ data: { token: signToken({ userId: user.id, role: user.role }), user: safeUser(user) } });
});
