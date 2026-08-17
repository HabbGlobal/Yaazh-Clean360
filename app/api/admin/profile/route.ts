import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/server/models/User";
import { ApiError } from "@/server/utils/ApiError";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { strongPassword } from "@/server/validators/authValidator";
import { safeUser } from "@/server/safeUser";

export const PATCH = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req, ["admin"]);
  const body = await req.json();
  const update: Record<string, unknown> = {};
  for (const key of ["name", "email", "phone", "address", "profileImage"]) if (body[key] !== undefined) update[key] = body[key];
  if (body.password) {
    const check = strongPassword.safeParse(body.password);
    if (!check.success) throw new ApiError(400, check.error.issues[0]?.message || "Password is too weak");
    update.password = await bcrypt.hash(body.password, 12);
  }
  const user = await User.findByIdAndUpdate(auth.userId, update, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, "Administrator not found");
  return NextResponse.json({ data: safeUser(user) });
});
