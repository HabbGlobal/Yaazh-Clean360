import { NextResponse, type NextRequest } from "next/server";
import { ReadinessVote } from "@/server/models/ReadinessVote";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const GET = handle(async (req: NextRequest) => {
  await requireAuth(req, ["admin"]);
  const votes = await ReadinessVote.find().populate("userId", "name email").populate("zoneId", "name assignedLorry").sort({ voteDate: -1, createdAt: -1 }).limit(250);
  return NextResponse.json({ data: votes });
});
