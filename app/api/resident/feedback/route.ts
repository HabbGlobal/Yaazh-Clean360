import { NextResponse, type NextRequest } from "next/server";
import { Feedback } from "@/server/models/Feedback";
import { handle, parseBody } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { feedbackSchema } from "@/server/validators/residentValidator";
import { getResidentZoneId } from "@/server/resident";
import { today } from "@/server/dates";

export const GET = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req, ["resident"]);
  const items = await Feedback.find({ userId: auth.userId }).sort({ createdAt: -1 }).limit(20);
  const avg = items.length ? Math.round((items.reduce((sum, item) => sum + item.rating, 0) / items.length) * 10) / 10 : 0;
  return NextResponse.json({ data: { items, averageRating: avg, total: items.length } });
});

export const POST = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req, ["resident"]);
  const body = await parseBody(req, feedbackSchema);
  const zoneId = await getResidentZoneId(auth.userId);
  const feedback = await Feedback.create({ ...body, serviceDate: body.serviceDate || today(), userId: auth.userId, zoneId });
  return NextResponse.json({ data: feedback }, { status: 201 });
});
