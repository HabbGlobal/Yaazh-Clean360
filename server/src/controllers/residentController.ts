import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/authenticate";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/User";
import { ReadinessVote } from "../models/ReadinessVote";
import { Complaint } from "../models/Complaint";
import { Feedback } from "../models/Feedback";

const COLOMBO_TIME_ZONE = "Asia/Colombo";
const localDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: COLOMBO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
};
const today = () => localDate();
const weekdayName = (voteDate: string) => new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: COLOMBO_TIME_ZONE }).format(new Date(`${voteDate}T00:00:00+05:30`));
const isCollectionDay = (voteDate: string) => weekdayName(voteDate) !== "Sunday";
const addDays = (offset: number) => {
  const next = new Date();
  next.setUTCDate(next.getUTCDate() + offset);
  return localDate(next);
};
const recentCollectionDates = () => {
  const dates: string[] = [];
  let offset = 0;
  while (dates.length < 7) {
    const date = addDays(offset);
    if (isCollectionDay(date)) dates.unshift(date);
    offset -= 1;
  }
  return dates;
};

async function getResidentZoneId(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.accountStatus === "suspended") throw new ApiError(403, "This account is suspended");
  if (!user.zoneId) throw new ApiError(400, "Select a zone before using this feature");
  return user.zoneId;
}

export async function upsertReadinessVote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const zoneId = await getResidentZoneId(req.auth!.userId);
    const voteDate = req.body.voteDate || today();
    if (!isCollectionDay(voteDate)) throw new ApiError(400, "Readiness voting is available only on Monday to Saturday collection days");
    const vote = await ReadinessVote.findOneAndUpdate(
      { userId: req.auth!.userId, voteDate },
      { userId: req.auth!.userId, zoneId, voteDate, response: req.body.response },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ data: vote });
  } catch (error) { next(error); }
}

export async function getReadinessSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const zoneId = await getResidentZoneId(req.auth!.userId);
    const voteDate = String(req.query.date || today());
    const votes = await ReadinessVote.find({ zoneId, voteDate });
    const zoneResidentCount = await User.countDocuments({ zoneId, role: "resident", accountStatus: "active" });
    const ready = votes.filter((vote) => vote.response === "ready").length;
    const notReady = votes.length - ready;
    const mine = await ReadinessVote.findOne({ userId: req.auth!.userId, voteDate });
    const totalResidents = Math.max(zoneResidentCount, votes.length, 1);
    res.json({ data: { voteDate, ready, notReady, total: votes.length, zoneResidentCount, notVoted: Math.max(totalResidents - votes.length, 0), readyPercentage: Math.round((ready / totalResidents) * 100), notReadyPercentage: Math.round((notReady / totalResidents) * 100), votedPercentage: Math.round((votes.length / totalResidents) * 100), isCollectionDay: isCollectionDay(voteDate), myResponse: mine?.response || null } });
  } catch (error) { next(error); }
}

export async function getReadinessHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const zoneId = await getResidentZoneId(req.auth!.userId);
    const dates = recentCollectionDates();
    const votes = await ReadinessVote.find({ zoneId, voteDate: { $in: dates } });
    const mine = await ReadinessVote.find({ userId: req.auth!.userId, voteDate: { $in: dates } });
    const zoneResidentCount = await User.countDocuments({ zoneId, role: "resident", accountStatus: "active" });
    res.json({ data: dates.map((voteDate) => {
      const dayVotes = votes.filter((vote) => vote.voteDate === voteDate);
      const ready = dayVotes.filter((vote) => vote.response === "ready").length;
      const notReady = dayVotes.length - ready;
      const totalResidents = Math.max(zoneResidentCount, dayVotes.length, 1);
      return { voteDate, ready, notReady, total: dayVotes.length, zoneResidentCount, notVoted: Math.max(totalResidents - dayVotes.length, 0), readyPercentage: Math.round((ready / totalResidents) * 100), notReadyPercentage: Math.round((notReady / totalResidents) * 100), votedPercentage: Math.round((dayVotes.length / totalResidents) * 100), isCollectionDay: true, myResponse: mine.find((vote) => vote.voteDate === voteDate)?.response || null };
    }) });
  } catch (error) { next(error); }
}

export async function createComplaint(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const zoneId = await getResidentZoneId(req.auth!.userId);
    const complaint = await Complaint.create({ ...req.body, userId: req.auth!.userId, zoneId });
    res.status(201).json({ data: complaint });
  } catch (error) { next(error); }
}

export async function listMyComplaints(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ data: await Complaint.find({ userId: req.auth!.userId }).sort({ createdAt: -1 }).limit(20) });
  } catch (error) { next(error); }
}

export async function deleteMyComplaint(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const complaint = await Complaint.findOneAndDelete({ _id: req.params.id, userId: req.auth!.userId });
    if (!complaint) throw new ApiError(404, "Complaint not found");
    res.status(204).send();
  } catch (error) { next(error); }
}

export async function createFeedback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const zoneId = await getResidentZoneId(req.auth!.userId);
    const feedback = await Feedback.create({ ...req.body, serviceDate: req.body.serviceDate || today(), userId: req.auth!.userId, zoneId });
    res.status(201).json({ data: feedback });
  } catch (error) { next(error); }
}

export async function listMyFeedback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await Feedback.find({ userId: req.auth!.userId }).sort({ createdAt: -1 }).limit(20);
    const avg = items.length ? Math.round((items.reduce((sum, item) => sum + item.rating, 0) / items.length) * 10) / 10 : 0;
    res.json({ data: { items, averageRating: avg, total: items.length } });
  } catch (error) { next(error); }
}
