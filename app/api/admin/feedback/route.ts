import { NextResponse, type NextRequest } from "next/server";
import { Feedback } from "@/server/models/Feedback";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const GET = handle(async (req: NextRequest) => {
  await requireAuth(req, ["admin"]);
  const feedback = await Feedback.find().populate("userId", "name email").populate("zoneId", "name").sort({ createdAt: -1 }).limit(250);
  return NextResponse.json({ data: feedback });
});
