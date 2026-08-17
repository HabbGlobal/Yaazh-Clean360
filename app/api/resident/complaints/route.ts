import { NextResponse, type NextRequest } from "next/server";
import { Complaint } from "@/server/models/Complaint";
import { handle, parseBody } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { complaintSchema } from "@/server/validators/residentValidator";
import { getResidentZoneId } from "@/server/resident";

export const GET = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req, ["resident"]);
  return NextResponse.json({ data: await Complaint.find({ userId: auth.userId }).sort({ createdAt: -1 }).limit(20).select("-photoEvidence") });
});

export const POST = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req, ["resident"]);
  const body = await parseBody(req, complaintSchema);
  const zoneId = await getResidentZoneId(auth.userId);
  const complaint = await Complaint.create({ ...body, userId: auth.userId, zoneId });
  return NextResponse.json({ data: complaint }, { status: 201 });
});
