import { NextResponse, type NextRequest } from "next/server";
import { ReadinessVote } from "@/server/models/ReadinessVote";
import { User } from "@/server/models/User";
import { ApiError } from "@/server/utils/ApiError";
import { handle, parseBody } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { readinessVoteSchema } from "@/server/validators/residentValidator";
import { getResidentZoneId } from "@/server/resident";
import { today, isCollectionDay } from "@/server/dates";

export const POST = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req, ["resident"]);
  const body = await parseBody(req, readinessVoteSchema);
  const zoneId = await getResidentZoneId(auth.userId);
  const voteDate = body.voteDate || today();
  if (!isCollectionDay(voteDate)) throw new ApiError(400, "Readiness voting is available only on Monday to Saturday collection days");
  const vote = await ReadinessVote.findOneAndUpdate(
    { userId: auth.userId, voteDate },
    { userId: auth.userId, zoneId, voteDate, response: body.response },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return NextResponse.json({ data: vote });
});

export const GET = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req, ["resident"]);
  const zoneId = await getResidentZoneId(auth.userId);
  const voteDate = String(req.nextUrl.searchParams.get("date") || today());
  const votes = await ReadinessVote.find({ zoneId, voteDate });
  const zoneResidentCount = await User.countDocuments({ zoneId, role: "resident", accountStatus: "active" });
  const ready = votes.filter((vote) => vote.response === "ready").length;
  const notReady = votes.length - ready;
  const mine = await ReadinessVote.findOne({ userId: auth.userId, voteDate });
  const totalResidents = Math.max(zoneResidentCount, votes.length, 1);
  return NextResponse.json({ data: { voteDate, ready, notReady, total: votes.length, zoneResidentCount, notVoted: Math.max(totalResidents - votes.length, 0), readyPercentage: Math.round((ready / totalResidents) * 100), notReadyPercentage: Math.round((notReady / totalResidents) * 100), votedPercentage: Math.round((votes.length / totalResidents) * 100), isCollectionDay: isCollectionDay(voteDate), myResponse: mine?.response || null } });
});
