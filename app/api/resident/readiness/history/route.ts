import { NextResponse, type NextRequest } from "next/server";
import { ReadinessVote } from "@/server/models/ReadinessVote";
import { User } from "@/server/models/User";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { getResidentZoneId } from "@/server/resident";
import { recentCollectionDates } from "@/server/dates";

export const GET = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req, ["resident"]);
  const zoneId = await getResidentZoneId(auth.userId);
  const dates = recentCollectionDates();
  const [votes, mine, zoneResidentCount] = await Promise.all([
    ReadinessVote.find({ zoneId, voteDate: { $in: dates } }),
    ReadinessVote.find({ userId: auth.userId, voteDate: { $in: dates } }),
    User.countDocuments({ zoneId, role: "resident", accountStatus: "active" })
  ]);
  return NextResponse.json({
    data: dates.map((voteDate) => {
      const dayVotes = votes.filter((vote) => vote.voteDate === voteDate);
      const ready = dayVotes.filter((vote) => vote.response === "ready").length;
      const notReady = dayVotes.length - ready;
      const totalResidents = Math.max(zoneResidentCount, dayVotes.length, 1);
      return { voteDate, ready, notReady, total: dayVotes.length, zoneResidentCount, notVoted: Math.max(totalResidents - dayVotes.length, 0), readyPercentage: Math.round((ready / totalResidents) * 100), notReadyPercentage: Math.round((notReady / totalResidents) * 100), votedPercentage: Math.round((dayVotes.length / totalResidents) * 100), isCollectionDay: true, myResponse: mine.find((vote) => vote.voteDate === voteDate)?.response || null };
    })
  });
});
