import { NextResponse, type NextRequest } from "next/server";
import { User } from "@/server/models/User";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { safeUser } from "@/server/safeUser";

export const GET = handle(async (req: NextRequest) => {
  await requireAuth(req, ["admin"]);
  const users = await User.find({ role: "resident" }).populate("zoneId").sort({ createdAt: -1 });
  return NextResponse.json({ data: users.map(safeUser) });
});
