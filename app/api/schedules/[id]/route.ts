import { NextResponse, type NextRequest } from "next/server";
import { CollectionSchedule } from "@/server/models/CollectionSchedule";
import { ApiError } from "@/server/utils/ApiError";
import { handle, noContent, parseBody } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { scheduleUpdateSchema } from "@/server/validators/scheduleValidator";

export const PATCH = handle(async (req: NextRequest, { params }) => {
  await requireAuth(req, ["admin"]);
  const { id } = await params;
  const body = await parseBody(req, scheduleUpdateSchema);
  const schedule = await CollectionSchedule.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!schedule) throw new ApiError(404, "Schedule not found");
  return NextResponse.json({ data: schedule });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  await requireAuth(req, ["admin"]);
  const { id } = await params;
  const schedule = await CollectionSchedule.findByIdAndDelete(id);
  if (!schedule) throw new ApiError(404, "Schedule not found");
  return noContent();
});
