import { NextResponse, type NextRequest } from "next/server";
import { User } from "@/server/models/User";
import { ApiError } from "@/server/utils/ApiError";
import { handle, parseBody } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { profileSchema } from "@/server/validators/authValidator";
import { safeUser } from "@/server/safeUser";

export const PATCH = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req, ["resident"]);
  const body = await parseBody(req, profileSchema);
  const user = await User.findByIdAndUpdate(auth.userId, body, { new: true, runValidators: true }).populate("zoneId");
  if (!user) throw new ApiError(404, "User not found");
  return NextResponse.json({ data: safeUser(user) });
});
