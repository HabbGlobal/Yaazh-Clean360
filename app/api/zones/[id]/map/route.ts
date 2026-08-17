import { NextResponse, type NextRequest } from "next/server";
import { Zone } from "@/server/models/Zone";
import { ApiError } from "@/server/utils/ApiError";
import { handle } from "@/server/handler";

export const GET = handle(async (_req: NextRequest, { params }) => {
  const { id } = await params;
  const zone = await Zone.findOne({ _id: id, isActive: true });
  if (!zone || !zone.imageBase64) throw new ApiError(404, "Zone map not found");
  const match = /^data:(image\/(?:png|jpe?g|webp|gif));base64,([A-Za-z0-9+/=]+)$/i.exec(zone.imageBase64);
  if (!match) throw new ApiError(500, "Zone map is not a valid image");
  return new NextResponse(Buffer.from(match[2], "base64"), { status: 200, headers: { "Content-Type": match[1], "Cache-Control": "public, max-age=86400" } });
});
