import { NextResponse, type NextRequest } from "next/server";
import { CollectionSchedule } from "@/server/models/CollectionSchedule";
import { Zone } from "@/server/models/Zone";
import { ApiError } from "@/server/utils/ApiError";
import { handle, parseBody } from "@/server/handler";
import { requireAuth } from "@/server/auth";
import { scheduleSchema } from "@/server/validators/scheduleValidator";

export const POST = handle(async (req: NextRequest) => {
  await requireAuth(req, ["admin"]);
  const body = await parseBody(req, scheduleSchema);
  if (!(await Zone.exists({ _id: body.zoneId, isActive: true }))) throw new ApiError(404, "Active zone not found");
  return NextResponse.json({ data: await CollectionSchedule.create(body) }, { status: 201 });
});
