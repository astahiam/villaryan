import { haversineMeters } from "./distance";
import type { NearbyPlace } from "../types";

const OVERPASS = "https://overpass-api.de/api/interpreter";

const KIND_QUERY: Array<{ kind: string; filter: string }> = [
  { kind: "restaurant", filter: 'node["amenity"="restaurant"]' },
  { kind: "hospital", filter: 'node["amenity"="hospital"]' },
  { kind: "public_transport", filter: 'node["public_transport"="station"]' },
  { kind: "university", filter: 'node["amenity"="university"]' },
  { kind: "tourist_attraction", filter: 'node["tourism"="attraction"]' },
];

export async function fetchNearbyPois(
  lat: number,
  lng: number,
  radiusMeters = 2500,
): Promise<NearbyPlace[]> {
  const around = `around:${radiusMeters},${lat},${lng}`;
  const body = `
    [out:json][timeout:12];
    (
      ${KIND_QUERY.map((item) => `${item.filter}(${around});`).join("\n")}
    );
    out body 40;
  `;
  try {
    const response = await fetch(OVERPASS, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(body)}`,
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return [];
    const data = (await response.json()) as {
      elements?: Array<{
        id: number;
        lat: number;
        lon: number;
        tags?: { name?: string; amenity?: string; tourism?: string; public_transport?: string };
      }>;
    };
    const results: NearbyPlace[] = [];
    for (const element of data.elements ?? []) {
      if (!element.tags?.name) continue;
      const kind =
        KIND_QUERY.find((item) => {
          if (item.kind === "restaurant") return element.tags?.amenity === "restaurant";
          if (item.kind === "hospital") return element.tags?.amenity === "hospital";
          if (item.kind === "university") return element.tags?.amenity === "university";
          if (item.kind === "tourist_attraction") return element.tags?.tourism === "attraction";
          if (item.kind === "public_transport")
            return element.tags?.public_transport === "station";
          return false;
        })?.kind ?? "place";
      results.push({
        id: String(element.id),
        name: element.tags.name,
        kind,
        latitude: element.lat,
        longitude: element.lon,
        distanceMeters: Math.round(
          haversineMeters(lat, lng, element.lat, element.lon),
        ),
      });
    }
    results.sort((a, b) => a.distanceMeters - b.distanceMeters);
    const seen = new Set<string>();
    return results.filter((item) => {
      const key = `${item.kind}:${item.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 18);
  } catch {
    return [];
  }
}
