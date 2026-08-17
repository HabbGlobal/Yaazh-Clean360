import { NextResponse, type NextRequest } from "next/server";
import { CollectionSchedule } from "@/server/models/CollectionSchedule";
import { Zone } from "@/server/models/Zone";
import { ApiError } from "@/server/utils/ApiError";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const GET = handle(async (req: NextRequest, { params }) => {
  await requireAuth(req);
  const { zoneId } = await params;
  const zone = await Zone.findById(zoneId);
  if (!zone) throw new ApiError(404, "Zone not found");
  return NextResponse.json({ data: await CollectionSchedule.find({ zoneId: zone.id, isActive: true }).sort({ weekday: 1 }) });
});
