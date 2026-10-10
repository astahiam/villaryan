import { NextResponse } from "next/server";
import { stayApiConfigured, objectStorageConfigured, mapboxGeocodingConfigured } from "@/lib/env";
import { prisma } from "@/lib/db";

export async function GET() {
  let database = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }
  return NextResponse.json({
    ok: database === "ok",
    database,
    stayapi: stayApiConfigured() ? "configured" : "mock",
    objectStorage: objectStorageConfigured() ? "configured" : "local-uploads",
    geocoding: mapboxGeocodingConfigured() ? "mapbox" : "gazetteer+nominatim",
  });
}
