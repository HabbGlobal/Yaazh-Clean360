import { NextResponse, type NextRequest } from "next/server";
import { Zone } from "@/server/models/Zone";
import { handle } from "@/server/handler";
import { requireAuth } from "@/server/auth";

async function nextZoneNumber() {
  const top = await Zone.findOne().sort({ zoneNumber: -1 }).select("zoneNumber");
  return (top?.zoneNumber ?? 0) + 1;
}

export const GET = handle(async () => {
  return NextResponse.json({ data: await Zone.find({ isActive: true }).sort({ name: 1 }).select("-imageBase64") });
});

export const POST = handle(async (req: NextRequest) => {
  await requireAuth(req, ["admin"]);
  const body = await req.json();
  const zoneNumber = body.zoneNumber ?? (await nextZoneNumber());
  return NextResponse.json({ data: await Zone.create({ ...body, zoneNumber }) }, { status: 201 });
});
