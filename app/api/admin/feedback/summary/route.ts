import { NextResponse, type NextRequest } from "next/server";
import { Feedback } from "@/server/models/Feedback";
import { Zone } from "@/server/models/Zone";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const GET = handle(async (req: NextRequest) => {
  await requireAuth(req, ["admin"]);
  const grouped = await Feedback.aggregate([{ $group: { _id: "$rating", count: { $sum: 1 } } }]);
  const ratingMap = new Map<number, number>(grouped.map((item: any) => [item._id, item.count]));
  const ratings = [1, 2, 3, 4, 5].map((rating) => ({ rating, count: ratingMap.get(rating) || 0 }));
  const total = ratings.reduce((sum, item) => sum + item.count, 0);
  const averageRating = total ? Number(((ratings.reduce((sum, item) => sum + item.rating * item.count, 0)) / total).toFixed(1)) : 0;
  const zoneAgg = await Feedback.aggregate([{ $group: { _id: "$zoneId", count: { $sum: 1 }, sum: { $sum: "$rating" } } }]);
  const zones = await Zone.find({ _id: { $in: zoneAgg.map((item: any) => item._id) } }).select("name");
  const zoneMap = new Map<string, string>(zones.map((zone) => [String(zone._id), zone.name]));
  const zoneRows = zoneAgg.map((item: any) => ({ zoneId: item._id, zoneName: zoneMap.get(String(item._id)) || "Unknown", count: item.count, averageRating: Number((item.sum / item.count).toFixed(1)) })).sort((a: { averageRating: number }, b: { averageRating: number }) => b.averageRating - a.averageRating);
  const items = await Feedback.find().populate("userId", "name email").populate("zoneId", "name").sort({ createdAt: -1 }).limit(300);
  return NextResponse.json({ data: { total, averageRating, ratings, zones: zoneRows, items } });
});
