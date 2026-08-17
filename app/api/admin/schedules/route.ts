import { NextResponse, type NextRequest } from "next/server";
import { CollectionSchedule } from "@/server/models/CollectionSchedule";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const GET = handle(async (req: NextRequest) => {
  await requireAuth(req, ["admin"]);
  return NextResponse.json({ data: await CollectionSchedule.find().sort({ createdAt: -1 }) });
});
