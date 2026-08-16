import type { NextFunction, Response } from "express";
import bcrypt from "bcryptjs";
import type { AuthRequest } from "../middleware/authenticate";
import { ApiError } from "../utils/ApiError";
import { strongPassword } from "../validators/authValidator";
import { User } from "../models/User";
import { Zone } from "../models/Zone";
import { Complaint, COMPLAINT_TYPES } from "../models/Complaint";
import { ReadinessVote } from "../models/ReadinessVote";
import { Feedback } from "../models/Feedback";
import { CollectionSchedule } from "../models/CollectionSchedule";

const colomboDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
};
import { sendComplaintStatusEmail } from "../utils/email";

const safeUser = (user: any) => ({
  _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address,
  role: user.role, emailVerified: user.emailVerified, accountStatus: user.accountStatus,
  profileImage: user.profileImage, zoneId: user.zoneId, createdAt: user.createdAt
});

export async function adminOverview(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
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
    res.json({
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
  } catch (error) { next(error); }
}

export async function listAdminZones(_req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json({ data: await Zone.find().sort({ zoneNumber: 1 }).select("-imageBase64") }); }
  catch (e) { next(e); }
}

export async function listResidents(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await User.find({ role: "resident" }).populate("zoneId").sort({ createdAt: -1 });
    res.json({ data: users.map(safeUser) });
  } catch (error) { next(error); }
}

export async function updateResidentStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findOneAndUpdate({ _id: req.params.id, role: "resident" }, { accountStatus: req.body.accountStatus }, { new: true }).populate("zoneId");
    if (!user) throw new ApiError(404, "Resident not found");
    res.json({ data: safeUser(user) });
  } catch (error) { next(error); }
}

export async function deleteResident(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: "resident" });
    if (!user) throw new ApiError(404, "Resident not found");
    await Promise.all([ReadinessVote.deleteMany({ userId: user._id }), Complaint.deleteMany({ userId: user._id }), Feedback.deleteMany({ userId: user._id })]);
    res.status(204).send();
  } catch (error) { next(error); }
}

export async function listAdminComplaints(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const complaints = await Complaint.find().populate("userId", "name email phone").populate("zoneId", "name assignedLorry").sort({ createdAt: -1 });
    const counts = await Complaint.aggregate([
      { $group: { _id: "$userId", total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } } } }
    ]);
    const countMap = new Map<string, { total: number; resolved: number }>(counts.map((item: any) => [String(item._id), { total: item.total, resolved: item.resolved }]));
    const data = complaints.map((complaint: any) => {
      const userId = complaint.userId?._id ?? complaint.userId;
      return { ...complaint.toObject(), userStats: countMap.get(String(userId)) || { total: 0, resolved: 0 } };
    });
    res.json({ data });
  } catch (error) { next(error); }
}

export async function updateAdminComplaint(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status, resolutionNote: req.body.resolutionNote || "" }, { new: true, runValidators: true }).populate("userId", "name email").populate("zoneId", "name assignedLorry");
    if (!complaint) throw new ApiError(404, "Complaint not found");
    const resident = complaint.userId as any;
    let notification = "not sent";
    if (resident?.email) {
      try { await sendComplaintStatusEmail(resident.email, resident.name, complaint.status, complaint.resolutionNote || ""); notification = "sent"; }
      catch { notification = "failed"; }
    }
    res.json({ data: { complaint, notification } });
  } catch (error) { next(error); }
}

export async function deleteAdminComplaint(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) throw new ApiError(404, "Complaint not found");
    res.status(204).send();
  } catch (error) { next(error); }
}

export async function listAdminVotes(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const votes = await ReadinessVote.find().populate("userId", "name email").populate("zoneId", "name assignedLorry").sort({ voteDate: -1, createdAt: -1 }).limit(250);
    res.json({ data: votes });
  } catch (error) { next(error); }
}

export async function listAdminVoteSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const voteDate = String(req.query.date || colomboDate());
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
    res.json({ data: { voteDate, zones: zoneRows, totals: { ...totals, readyPercentage: Math.round((totals.ready / Math.max(totals.voted, 1)) * 100) } } });
  } catch (error) { next(error); }
}

export async function listAdminFeedback(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const feedback = await Feedback.find().populate("userId", "name email").populate("zoneId", "name").sort({ createdAt: -1 }).limit(250);
    res.json({ data: feedback });
  } catch (error) { next(error); }
}

export async function listAdminFeedbackSummary(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
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
    res.json({ data: { total, averageRating, ratings, zones: zoneRows, items } });
  } catch (error) { next(error); }
}

export async function listAdminSchedules(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schedules = await CollectionSchedule.find().sort({ createdAt: -1 });
    res.json({ data: schedules });
  } catch (error) { next(error); }
}

export async function updateAdminProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const update: Record<string, unknown> = {};
    for (const key of ["name", "email", "phone", "address", "profileImage"]) if (req.body[key] !== undefined) update[key] = req.body[key];
    if (req.body.password) {
      const check = strongPassword.safeParse(req.body.password);
      if (!check.success) throw new ApiError(400, check.error.issues[0]?.message || "Password is too weak");
      update.password = await bcrypt.hash(req.body.password, 12);
    }
    const user = await User.findByIdAndUpdate(req.auth!.userId, update, { new: true, runValidators: true });
    if (!user) throw new ApiError(404, "Administrator not found");
    res.json({ data: safeUser(user) });
  } catch (error) { next(error); }
}
