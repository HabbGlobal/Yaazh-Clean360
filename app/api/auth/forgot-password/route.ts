import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/server/models/User";
import { EmailOtp } from "@/server/models/EmailOtp";
import { sendPasswordResetOtp } from "@/server/utils/email";
import { handle, parseBody } from "@/server/handler";
import { forgotPasswordSchema } from "@/server/validators/authValidator";

async function createOtp(email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await EmailOtp.findOneAndUpdate({ email }, { email, codeHash: await bcrypt.hash(code, 10), expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 }, { upsert: true, new: true, setDefaultsOnInsert: true });
  return code;
}

export const POST = handle(async (req: NextRequest) => {
  const body = await parseBody(req, forgotPasswordSchema);
  const user = await User.findOne({ email: body.email });
  if (user) await sendPasswordResetOtp(user.email, await createOtp(user.email));
  return NextResponse.json({ data: { email: body.email, message: "If this email is registered, a password reset code was sent" } });
});
