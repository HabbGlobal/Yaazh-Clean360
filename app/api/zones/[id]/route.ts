import { NextResponse, type NextRequest } from "next/server";
import { Zone } from "@/server/models/Zone";
import { ApiError } from "@/server/utils/ApiError";
import { handle, noContent } from "@/server/handler";
import { requireAuth } from "@/server/auth";

export const PATCH = handle(async (req: NextRequest, { params }) => {
  await requireAuth(req, ["admin"]);
  const { id } = await params;
  const body = await req.json();
  const zone = await Zone.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!zone) throw new ApiError(404, "Zone not found");
  return NextResponse.json({ data: zone });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  await requireAuth(req, ["admin"]);
  const { id } = await params;
  const zone = await Zone.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!zone) throw new ApiError(404, "Zone not found");
  return NextResponse.json({ data: zone });
});
