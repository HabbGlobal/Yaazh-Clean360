import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/server/models/User";
import { Zone } from "@/server/models/Zone";
import { EmailOtp } from "@/server/models/EmailOtp";
import { ApiError } from "@/server/utils/ApiError";
import { sendVerificationOtp } from "@/server/utils/email";
import { handle, parseBody } from "@/server/handler";
import { registerSchema } from "@/server/validators/authValidator";

async function createOtp(email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await EmailOtp.findOneAndUpdate({ email }, { email, codeHash: await bcrypt.hash(code, 10), expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 }, { upsert: true, new: true, setDefaultsOnInsert: true });
  return code;
}

export const POST = handle(async (req: NextRequest) => {
  const body = await parseBody(req, registerSchema);
  const { name, password, phone, address, zoneId, profileImage } = body;
  const email = String(body.email).trim().toLowerCase();
  if (!(await Zone.exists({ _id: zoneId, isActive: true }))) throw new ApiError(400, "Select an active zone");
  const existing = await User.findOne({ email });
  if (existing?.emailVerified) throw new ApiError(409, "An account already uses this email");
  const values = { name, phone, address, password: await bcrypt.hash(password, 12), zoneId, profileImage: profileImage || existing?.profileImage || "" };
  if (existing) { Object.assign(existing, values); await existing.save(); }
  else await User.create({ email, ...values });
  await sendVerificationOtp(email, await createOtp(email));
  return NextResponse.json({ data: { email, message: "Verification code sent to your email" } }, { status: 201 });
});
