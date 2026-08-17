import type { NextRequest } from "next/server";
import { Complaint } from "@/server/models/Complaint";
import { ApiError } from "@/server/utils/ApiError";
import { handle, noContent } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const auth = await requireAuth(req, ["resident"]);
  const { id } = await params;
  const complaint = await Complaint.findOneAndDelete({ _id: id, userId: auth.userId });
  if (!complaint) throw new ApiError(404, "Complaint not found");
  return noContent();
});
