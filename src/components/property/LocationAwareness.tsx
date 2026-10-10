"use client";

import { useEffect, useState } from "react";
import { formatDistance } from "@/lib/geo/distance";
import type { NearbyPlace } from "@/lib/types";

type Props = {
  latitude: number;
  longitude: number;
  locationLabel: string;
  originLat?: number;
  originLng?: number;
};

const KIND_LABEL: Record<string, string> = {
  restaurant: "Restaurants",
  hospital: "Hospitals",
  public_transport: "Public transport",
  university: "Universities",
  tourist_attraction: "Attractions",
};

export function LocationAwareness({ latitude, longitude, locationLabel, originLat, originLng }: Props) {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [status, setStatus] = useState("Loading nearby context…");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const response = await fetch(`/api/pois?lat=${latitude}&lng=${longitude}`);
      if (!response.ok) {
        if (!cancelled) setStatus("Nearby points of interest are temporarily unavailable.");
        return;
      }
      const data = (await response.json()) as { results: NearbyPlace[]; source?: string };
      if (cancelled) return;
      setPlaces(data.results ?? []);
      setStatus(
        data.results?.length
          ? "Selected nearby places from OpenStreetMap. This is not exhaustive or verified."
          : "No nearby points were returned for this area.",
      );
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  const grouped = places.reduce<Record<string, NearbyPlace[]>>((acc, place) => {
    acc[place.kind] = acc[place.kind] ?? [];
    acc[place.kind].push(place);
    return acc;
  }, {});

  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-6">
      <p className="text-sm uppercase tracking-[0.18em] text-forest-800">360° Location Awareness</p>
      <h2 className="mt-2 font-serif text-3xl">Around {locationLabel}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-700">
        This view helps you understand the surrounding area. Distances below are straight-line, not road travel.
        Travel times are not shown because a routing service is not configured. This is not 360° photography.
      </p>
      {originLat != null && originLng != null ? (
        <p className="mt-3 text-sm text-ink-800">
          Approximate distance from your search point:{" "}
          {formatDistance(
            Math.round(
              6371000 *
                2 *
                Math.asin(
                  Math.sqrt(
                    Math.sin(((latitude - originLat) * Math.PI) / 360) ** 2 +
                      Math.cos((originLat * Math.PI) / 180) *
                        Math.cos((latitude * Math.PI) / 180) *
                        Math.sin(((longitude - originLng) * Math.PI) / 360) ** 2,
                  ),
                ),
            ),
          )}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-ink-700">{status}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Object.entries(grouped).map(([kind, items]) => (
          <div key={kind}>
            <h3 className="text-sm font-medium">{KIND_LABEL[kind] ?? kind}</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-700">
              {items.slice(0, 4).map((item) => (
                <li key={item.id}>
                  {item.name} · {formatDistance(item.distanceMeters)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
