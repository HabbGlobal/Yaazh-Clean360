import { NextResponse, type NextRequest } from "next/server";
import { User } from "@/server/models/User";
import "@/server/models/Zone";
import { ApiError } from "@/server/utils/ApiError";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { safeUser } from "@/server/safeUser";

export const GET = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const user = await User.findById(auth.userId).populate({ path: "zoneId", select: "-imageBase64" });
  if (!user) throw new ApiError(404, "User not found");
  return NextResponse.json({ data: safeUser(user) });
});
