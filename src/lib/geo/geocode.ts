import { formatPlaceLabel, searchGazetteer, type Place } from "./gazetteer";
import { mapboxGeocodingConfigured, getEnv } from "../env";
import { roundCoordinate } from "./distance";

export type GeocodeHit = {
  label: string;
  latitude: number;
  longitude: number;
  source: "gazetteer" | "mapbox" | "nominatim";
};

function fromPlace(place: Place): GeocodeHit {
  return {
    label: formatPlaceLabel(place),
    latitude: place.latitude,
    longitude: place.longitude,
    source: "gazetteer",
  };
}

export async function geocodeQuery(query: string): Promise<GeocodeHit[]> {
  const local = searchGazetteer(query).map(fromPlace);
  if (local.length >= 5) return local;

  try {
    const remote = mapboxGeocodingConfigured()
      ? await geocodeMapbox(query)
      : await geocodeNominatim(query);
    const merged = [...local];
    for (const hit of remote) {
      if (!merged.some((item) => item.label === hit.label)) merged.push(hit);
    }
    return merged.slice(0, 8);
  } catch {
    return local;
  }
}

async function geocodeNominatim(query: string): Promise<GeocodeHit[]> {
  const env = getEnv();
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");
  const response = await fetch(url, {
    headers: { "User-Agent": env.NOMINATIM_USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) return [];
  const data = (await response.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;
  return data.map((item) => ({
    label: item.display_name,
    latitude: roundCoordinate(Number(item.lat), 5),
    longitude: roundCoordinate(Number(item.lon), 5),
    source: "nominatim" as const,
  }));
}

async function geocodeMapbox(query: string): Promise<GeocodeHit[]> {
  const env = getEnv();
  const token = env.MAP_PROVIDER_API_KEY;
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "5");
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) return [];
  const data = (await response.json()) as {
    features?: Array<{ place_name: string; center: [number, number] }>;
  };
  return (data.features ?? []).map((feature) => ({
    label: feature.place_name,
    latitude: feature.center[1],
    longitude: feature.center[0],
    source: "mapbox" as const,
  }));
}
