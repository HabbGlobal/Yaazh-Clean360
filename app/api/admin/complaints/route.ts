import { NextResponse, type NextRequest } from "next/server";
import { Complaint } from "@/server/models/Complaint";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const GET = handle(async (req: NextRequest) => {
  await requireAuth(req, ["admin"]);
  const complaints = await Complaint.find().populate("userId", "name email phone").populate("zoneId", "name assignedLorry").sort({ createdAt: -1 });
  const counts = await Complaint.aggregate([
    { $group: { _id: "$userId", total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } } } }
  ]);
  const countMap = new Map<string, { total: number; resolved: number }>(counts.map((item: any) => [String(item._id), { total: item.total, resolved: item.resolved }]));
  const data = complaints.map((complaint: any) => {
    const userId = complaint.userId?._id ?? complaint.userId;
    return { ...complaint.toObject(), userStats: countMap.get(String(userId)) || { total: 0, resolved: 0 } };
  });
  return NextResponse.json({ data });
});
