import { type NextRequest } from "next/server";
import { User } from "@/server/models/User";
import { ReadinessVote } from "@/server/models/ReadinessVote";
import { Complaint } from "@/server/models/Complaint";
import { Feedback } from "@/server/models/Feedback";
import { ApiError } from "@/server/utils/ApiError";
import { handle, noContent } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const DELETE = handle(async (req: NextRequest) => {
  const auth = await requireAuth(req, ["resident"]);
  const user = await User.findByIdAndDelete(auth.userId);
  if (!user) throw new ApiError(404, "User not found");
  await Promise.all([ReadinessVote.deleteMany({ userId: auth.userId }), Complaint.deleteMany({ userId: auth.userId }), Feedback.deleteMany({ userId: auth.userId })]);
  return noContent();
});
