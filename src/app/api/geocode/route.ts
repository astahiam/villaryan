import { NextRequest, NextResponse } from "next/server";
import { geocodeQuery } from "@/lib/geo/geocode";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = rateLimit(`geocode:${clientKey(request)}`, 40, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many location lookups." }, { status: 429 });
  }
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  const results = await geocodeQuery(q);
  return NextResponse.json({ results });
}
