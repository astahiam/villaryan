import { NextRequest, NextResponse } from "next/server";
import { fetchNearbyPois } from "@/lib/geo/pois";
import { z } from "zod";

const schema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export async function GET(request: NextRequest) {
  const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }
  const results = await fetchNearbyPois(parsed.data.lat, parsed.data.lng);
  return NextResponse.json({
    results,
    source: "OpenStreetMap Overpass",
    disclaimer: "Selected nearby places only. Not exhaustive or verified. Distances are straight-line.",
  });
}
