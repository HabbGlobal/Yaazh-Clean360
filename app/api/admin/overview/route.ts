import { NextResponse, type NextRequest } from "next/server";
import { User } from "@/server/models/User";
import { Zone } from "@/server/models/Zone";
import { Complaint, COMPLAINT_TYPES } from "@/server/models/Complaint";
import { ReadinessVote } from "@/server/models/ReadinessVote";
import { Feedback } from "@/server/models/Feedback";
import { CollectionSchedule } from "@/server/models/CollectionSchedule";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const GET = handle(async (req: NextRequest) => {
  await requireAuth(req, ["admin"]);
  const allZones = await Zone.find().select("name isActive");
  const zoneNameById = new Map(allZones.map((zone) => [String(zone._id), zone.name]));
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [residents, activeResidents, submitted, inReview, resolved, votes, feedback, schedules, residentsByZone, feedbackByRating, complaintTypeCounts, votesByResponse, complaintTrend] = await Promise.all([
    User.countDocuments({ role: "resident" }), User.countDocuments({ role: "resident", accountStatus: "active" }),
    Complaint.countDocuments({ status: "submitted" }), Complaint.countDocuments({ status: "in-review" }),
    Complaint.countDocuments({ status: "resolved" }), ReadinessVote.countDocuments(), Feedback.find().select("rating"),
    CollectionSchedule.countDocuments({ isActive: true }),
    User.aggregate([{ $match: { role: "resident", zoneId: { $ne: null } } }, { $group: { _id: "$zoneId", count: { $sum: 1 } } }]),
    Feedback.aggregate([{ $group: { _id: "$rating", count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: "$complaintType", count: { $sum: 1 } } }]),
    ReadinessVote.aggregate([{ $group: { _id: "$response", count: { $sum: 1 } } }]),
    Complaint.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
  ]);
  const averageRating = feedback.length ? Number((feedback.reduce((total, item) => total + item.rating, 0) / feedback.length).toFixed(1)) : 0;
  const residentsByZoneNamed = residentsByZone.map((item: any) => ({ zone: zoneNameById.get(String(item._id)) || "Unassigned", count: item.count })).sort((a, b) => b.count - a.count);
  const assigned = residentsByZoneNamed.reduce((total, item) => total + item.count, 0);
  if (residents - assigned > 0) residentsByZoneNamed.push({ zone: "Unassigned", count: residents - assigned });
  return NextResponse.json({
    data: {
      residents, activeResidents, zones: allZones.filter((zone) => zone.isActive).length, schedules, votes,
      complaints: { submitted, inReview, resolved, total: submitted + inReview + resolved },
      feedback: { total: feedback.length, averageRating },
      complaintTypes: COMPLAINT_TYPES.map((type) => ({ type, count: complaintTypeCounts.find((item: any) => item._id === type)?.count || 0 })),
      feedbackRatings: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: feedbackByRating.find((item: any) => item._id === rating)?.count || 0 })),
      residentsByZone: residentsByZoneNamed,
      voteResponses: [{ response: "ready", count: votesByResponse.find((item: any) => item._id === "ready")?.count || 0 }, { response: "not-ready", count: votesByResponse.find((item: any) => item._id === "not-ready")?.count || 0 }],
      complaintsTrend: complaintTrend.map((item: any) => ({ date: item._id, count: item.count }))
    }
  });
});
