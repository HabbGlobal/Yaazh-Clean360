import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/server/models/User";
import { EmailOtp } from "@/server/models/EmailOtp";
import { ApiError } from "@/server/utils/ApiError";
import { signToken } from "@/server/utils/jwt";
import { handle, parseBody } from "@/server/handler";
import { resetPasswordSchema } from "@/server/validators/authValidator";
import { safeUser } from "@/server/safeUser";

export const POST = handle(async (req: NextRequest) => {
  const { email, code, password } = await parseBody(req, resetPasswordSchema);
  const otp = await EmailOtp.findOne({ email });
  if (!otp || otp.expiresAt < new Date()) throw new ApiError(400, "Reset code is invalid or expired");
  if (otp.attempts >= 5) throw new ApiError(429, "Too many attempts. Request a new code.");
  if (!(await bcrypt.compare(code, otp.codeHash))) { otp.attempts += 1; await otp.save(); throw new ApiError(400, "Reset code is invalid or expired"); }
  const user = await User.findOneAndUpdate({ email }, { password: await bcrypt.hash(password, 12), emailVerified: true }, { new: true });
  if (!user) throw new ApiError(404, "User not found");
  await otp.deleteOne();
  return NextResponse.json({ data: { token: signToken({ userId: user.id, role: user.role }), user: safeUser(user) } });
});
