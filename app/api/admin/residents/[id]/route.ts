import type { NextRequest } from "next/server";
import { User } from "@/server/models/User";
import { ReadinessVote } from "@/server/models/ReadinessVote";
import { Complaint } from "@/server/models/Complaint";
import { Feedback } from "@/server/models/Feedback";
import { ApiError } from "@/server/utils/ApiError";
import { handle, noContent } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const DELETE = handle(async (req: NextRequest, { params }) => {
  await requireAuth(req, ["admin"]);
  const { id } = await params;
  const user = await User.findOneAndDelete({ _id: id, role: "resident" });
  if (!user) throw new ApiError(404, "Resident not found");
  await Promise.all([ReadinessVote.deleteMany({ userId: user._id }), Complaint.deleteMany({ userId: user._id }), Feedback.deleteMany({ userId: user._id })]);
  return noContent();
});
