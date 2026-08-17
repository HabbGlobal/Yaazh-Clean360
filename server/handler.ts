import { NextResponse, type NextRequest } from "next/server";
import type { ZodSchema } from "zod";
import { connectDatabase } from "./db";
import { ApiError } from "./utils/ApiError";

type RouteContext = { params: Promise<Record<string, string>> };

export function handle(fn: (req: NextRequest, ctx: RouteContext) => Promise<NextResponse>) {
  return async (req: NextRequest, ctx: RouteContext) => {
    try {
      await connectDatabase();
      return await fn(req, ctx);
    } catch (error: any) {
      console.error(error);
      const status = error instanceof ApiError ? error.statusCode : error?.name === "ValidationError" ? 400 : error?.code === 11000 ? 409 : 500;
      const message = error instanceof ApiError ? error.message : status === 409 ? "A record with this value already exists" : "Internal server error";
      return NextResponse.json({ message }, { status });
    }
  };
}

export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const json = await req.json().catch(() => ({}));
  const result = schema.safeParse(json);
  if (!result.success) throw new ApiError(400, result.error.issues[0]?.message || "Invalid request");
  return result.data;
}

export const noContent = () => new NextResponse(null, { status: 204 });
