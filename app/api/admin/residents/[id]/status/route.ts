import { NextResponse, type NextRequest } from "next/server";
import { User } from "@/server/models/User";
import { ApiError } from "@/server/utils/ApiError";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { safeUser } from "@/server/safeUser";

export const PATCH = handle(async (req: NextRequest, { params }) => {
  await requireAuth(req, ["admin"]);
  const { id } = await params;
  const body = await req.json();
  const user = await User.findOneAndUpdate({ _id: id, role: "resident" }, { accountStatus: body.accountStatus }, { new: true }).populate("zoneId");
  if (!user) throw new ApiError(404, "Resident not found");
  return NextResponse.json({ data: safeUser(user) });
});
