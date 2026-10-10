"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PropertyCard } from "@/components/property/PropertyCard";
import { SearchMap } from "./SearchMap";
import { CATEGORIES } from "@/lib/constants";
import type { SearchResponse } from "@/lib/types";

export function SearchExperience() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"split" | "list" | "map">("split");

  const queryString = params.toString();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/search?${queryString}`);
      const payload = await response.json();
      if (cancelled) return;
      if (!response.ok) {
        setError(payload.error ?? "Search could not be completed.");
        setData(null);
        setLoading(false);
        return;
      }
      setData(payload);
      setSelectedId(payload.results[0]?.id ?? null);
      setLoading(false);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  function update(next: Record<string, string | undefined>) {
    const copy = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) copy.delete(key);
      else copy.set(key, value);
    }
    copy.set("page", next.page ?? "1");
    router.push(`${pathname}?${copy.toString()}`);
  }

  const hrefExtra = useMemo(() => {
    const keep = new URLSearchParams();
    const q = params.get("q");
    const lat = params.get("lat");
    const lng = params.get("lng");
    if (q) keep.set("from", q);
    if (lat) keep.set("originLat", lat);
    if (lng) keep.set("originLng", lng);
    const s = keep.toString();
    return s ? `?${s}` : "";
  }, [params]);

  function onSelect(id: string) {
    setSelectedId(id);
    document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-forest-800">Pick one</p>
          <h1 className="mt-1 font-serif text-4xl">
            {params.get("q") || "Selected area"} · {params.get("intent") === "SALE" ? "Buy" : "Rent"}
          </h1>
          <p className="mt-2 text-sm text-ink-700">
            Search coordinates in the URL are rounded. Property pages never include your precise location.
          </p>
        </div>
        <div className="flex gap-2">
          {(["split", "list", "map"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-full px-4 py-2 text-sm ${view === mode ? "bg-forest-800 text-white" : "bg-white border border-sand-200"}`}
            >
              {mode === "split" ? "Map + list" : mode === "list" ? "List" : "Map"}
            </button>
          ))}
        </div>
      </div>

      <form
        className="mt-6 grid gap-3 rounded-2xl border border-sand-200 bg-white p-4 md:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          update({
            category: String(form.get("category") || "") || undefined,
            minPrice: String(form.get("minPrice") || "") || undefined,
            maxPrice: String(form.get("maxPrice") || "") || undefined,
            sort: String(form.get("sort") || "distance"),
            intent: String(form.get("intent") || "RENT"),
          });
        }}
      >
        <label className="text-sm">
          Intent
          <select name="intent" defaultValue={params.get("intent") ?? "RENT"} className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2">
            <option value="RENT">Rent</option>
            <option value="SALE">Buy</option>
          </select>
        </label>
        <label className="text-sm">
          Category
          <select name="category" defaultValue={params.get("category") ?? ""} className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2">
            <option value="">All types</option>
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Min price
          <input name="minPrice" type="number" min={0} defaultValue={params.get("minPrice") ?? ""} className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          Max price
          <input name="maxPrice" type="number" min={0} defaultValue={params.get("maxPrice") ?? ""} className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          Sort
          <select name="sort" defaultValue={params.get("sort") ?? "distance"} className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2">
            <option value="distance">Distance</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </label>
        <div className="md:col-span-5">
          <button type="submit" className="rounded-full bg-forest-800 px-4 py-2 text-sm text-white">
            Apply filters
          </button>
        </div>
      </form>

      {loading ? <p className="mt-8 text-ink-700">Loading matching places…</p> : null}
      {error ? <p className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</p> : null}
      {!loading && !error && data && data.results.length === 0 ? (
        <p className="mt-8 rounded-xl border border-sand-200 bg-white p-6">
          No properties matched this search. Try a wider area, another category, or switch Rent/Buy.
        </p>
      ) : null}

      {data?.providers?.length ? (
        <ul className="mt-4 flex flex-wrap gap-2 text-xs text-ink-700">
          {data.providers.map((provider) => (
            <li key={provider.id} className="rounded-full bg-sand-100 px-3 py-1">
              {provider.label}: {provider.status}
              {provider.detail ? ` — ${provider.detail}` : ""}
            </li>
          ))}
        </ul>
      ) : null}

      {data && data.results.length > 0 ? (
        <div className={`mt-6 grid gap-6 ${view === "split" ? "lg:grid-cols-[1.05fr_0.95fr]" : ""}`}>
          {view !== "map" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.results.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  hrefExtra={hrefExtra}
                  selected={selectedId === property.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ) : null}
          {view !== "list" ? (
            <div className={view === "map" ? "h-[70vh]" : "lg:sticky lg:top-24 lg:h-[70vh]"}>
              <SearchMap
                lat={data.location.lat}
                lng={data.location.lng}
                properties={data.results}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {data && data.total > data.pageSize ? (
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            disabled={data.page <= 1}
            onClick={() => update({ page: String(data.page - 1) })}
            className="rounded-full border border-sand-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <p className="self-center text-sm text-ink-700">
            Page {data.page} of {Math.ceil(data.total / data.pageSize)}
          </p>
          <button
            type="button"
            disabled={data.page * data.pageSize >= data.total}
            onClick={() => update({ page: String(data.page + 1) })}
            className="rounded-full border border-sand-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
