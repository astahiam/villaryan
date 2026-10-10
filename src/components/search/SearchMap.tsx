"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { NormalizedProperty } from "@/lib/types";

type Props = {
  lat: number;
  lng: number;
  properties: NormalizedProperty[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SearchMap({ lat, lng, properties, selectedId, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Map<string, maplibregl.Marker>>(new Map());

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap &copy; CARTO",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [lng, lat],
      zoom: 12,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();
    for (const property of properties) {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", property.title);
      el.className =
        "h-8 w-8 rounded-full border-2 border-white bg-forest-800 text-[0] shadow" +
        (selectedId === property.id ? " scale-125 bg-ink-900" : "");
      el.addEventListener("click", () => onSelect(property.id));
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map);
      markers.current.set(property.id, marker);
    }
  }, [properties, selectedId, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const property = properties.find((item) => item.id === selectedId);
    if (!property) return;
    map.easeTo({ center: [property.longitude, property.latitude], zoom: Math.max(map.getZoom(), 13) });
  }, [selectedId, properties]);

  return <div ref={container} className="h-[420px] w-full rounded-2xl md:h-full min-h-[420px]" role="application" aria-label="Property map" />;
}
