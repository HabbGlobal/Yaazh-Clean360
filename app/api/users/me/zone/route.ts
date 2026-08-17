import { NextResponse, type NextRequest } from "next/server";
import { User } from "@/server/models/User";
import { Zone } from "@/server/models/Zone";
import { ApiError } from "@/server/utils/ApiError";
import { handle, parseBody } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { zoneSelectionSchema } from "@/server/validators/authValidator";
import { safeUser } from "@/server/safeUser";

export const PATCH = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req, ["resident"]);
  const body = await parseBody(req, zoneSelectionSchema);
  const zone = await Zone.findOne({ _id: body.zoneId, isActive: true });
  if (!zone) throw new ApiError(404, "Active zone not found");
  const user = await User.findByIdAndUpdate(auth.userId, { zoneId: zone.id }, { new: true, runValidators: true }).populate("zoneId");
  if (!user) throw new ApiError(404, "User not found");
  return NextResponse.json({ data: safeUser(user) });
});
