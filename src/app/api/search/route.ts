import { NextRequest, NextResponse } from "next/server";
import { searchParamsSchema } from "@/lib/validation";
import { searchProperties } from "@/lib/search/service";
import { roundCoordinate } from "@/lib/geo/distance";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = rateLimit(`search:${clientKey(request)}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many searches. Try again shortly." }, { status: 429 });
  }

  const parsed = searchParamsSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a location and try again." }, { status: 400 });
  }

  const query = {
    ...parsed.data,
    lat: roundCoordinate(parsed.data.lat),
    lng: roundCoordinate(parsed.data.lng),
  };

  try {
    const result = await searchProperties(query, parsed.data.q || "Selected area");
    return NextResponse.json(result);
  } catch (error) {
    console.error("search_failed", error instanceof Error ? error.message : "error");
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 500 });
  }
}
