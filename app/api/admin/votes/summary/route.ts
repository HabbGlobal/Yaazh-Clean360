import { NextResponse, type NextRequest } from "next/server";
import { ReadinessVote } from "@/server/models/ReadinessVote";
import { Zone } from "@/server/models/Zone";
import { User } from "@/server/models/User";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { localDate as colomboDate } from "@/server/dates";

export const GET = handle(async (req: NextRequest) => {
  await requireAuth(req, ["admin"]);
  const voteDate = String(req.nextUrl.searchParams.get("date") || colomboDate());
  const zones = await Zone.find({ isActive: true }).sort({ zoneNumber: 1 }).select("-imageBase64");
  const residentCounts = await User.aggregate([
    { $match: { role: "resident", accountStatus: "active", zoneId: { $exists: true, $ne: null } } },
    { $group: { _id: "$zoneId", count: { $sum: 1 } } }
  ]);
  const residentMap = new Map<string, number>(residentCounts.map((item: any) => [String(item._id), item.count]));
  const votes = await ReadinessVote.find({ voteDate });
  const zoneRows = zones.map((zone) => {
    const zoneVotes = votes.filter((vote) => String(vote.zoneId) === String(zone._id));
    const ready = zoneVotes.filter((vote) => vote.response === "ready").length;
    const notReady = zoneVotes.length - ready;
    const activeResidents = residentMap.get(String(zone._id)) || 0;
    const total = Math.max(activeResidents, zoneVotes.length, 1);
    const voted = zoneVotes.length;
    return {
      zoneId: zone._id, zoneNumber: zone.zoneNumber, zoneName: zone.name, assignedLorry: zone.assignedLorry,
      activeResidents, voted, notVoted: Math.max(total - voted, 0), ready, notReady,
      readyPercentage: Math.round((ready / total) * 100), notReadyPercentage: Math.round((notReady / total) * 100), votedPercentage: Math.round((voted / total) * 100),
      decision: ready / total > 0.5
    };
  });
  const totals = zoneRows.reduce((acc, row) => ({ ready: acc.ready + row.ready, notReady: acc.notReady + row.notReady, voted: acc.voted + row.voted, notVoted: acc.notVoted + row.notVoted }), { ready: 0, notReady: 0, voted: 0, notVoted: 0 });
  return NextResponse.json({ data: { voteDate, zones: zoneRows, totals: { ...totals, readyPercentage: Math.round((totals.ready / Math.max(totals.voted, 1)) * 100) } } });
});
