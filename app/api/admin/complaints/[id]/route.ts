import { NextResponse, type NextRequest } from "next/server";
import { Complaint } from "@/server/models/Complaint";
import { ApiError } from "@/server/utils/ApiError";
import { handle, noContent } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { sendComplaintStatusEmail } from "@/server/utils/email";

export const PATCH = handle(async (req: NextRequest, { params }) => {
  await requireAuth(req, ["admin"]);
  const { id } = await params;
  const body = await req.json();
  const complaint = await Complaint.findByIdAndUpdate(id, { status: body.status, resolutionNote: body.resolutionNote || "" }, { new: true, runValidators: true }).populate("userId", "name email").populate("zoneId", "name assignedLorry");
  if (!complaint) throw new ApiError(404, "Complaint not found");
  const resident = complaint.userId as any;
  let notification = "not sent";
  if (resident?.email) {
    try { await sendComplaintStatusEmail(resident.email, resident.name, complaint.status, complaint.resolutionNote || ""); notification = "sent"; }
    catch { notification = "failed"; }
  }
  return NextResponse.json({ data: { complaint, notification } });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  await requireAuth(req, ["admin"]);
  const { id } = await params;
  const complaint = await Complaint.findByIdAndDelete(id);
  if (!complaint) throw new ApiError(404, "Complaint not found");
  return noContent();
});
