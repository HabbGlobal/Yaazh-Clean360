import { NextResponse, type NextRequest } from "next/server";
import { Zone } from "@/server/models/Zone";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const GET = handle(async (req: NextRequest) => {
  await requireAuth(req, ["admin"]);
  return NextResponse.json({ data: await Zone.find().sort({ zoneNumber: 1 }).select("-imageBase64") });
});
