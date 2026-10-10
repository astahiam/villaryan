"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { roundCoordinate } from "@/lib/geo/distance";

type Suggestion = { label: string; latitude: number; longitude: number };

export function SearchHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState<"RENT" | "SALE">("RENT");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<Suggestion | null>(null);

  async function onQueryChange(value: string) {
    setQuery(value);
    setSelected(null);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
    if (!response.ok) return;
    const data = (await response.json()) as { results: Suggestion[] };
    setSuggestions(data.results ?? []);
  }

  function go(lat: number, lng: number, label: string) {
    const params = new URLSearchParams({
      q: label,
      lat: String(roundCoordinate(lat)),
      lng: String(roundCoordinate(lng)),
      intent,
    });
    router.push(`/search?${params.toString()}`);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (selected) {
      go(selected.latitude, selected.longitude, selected.label);
      return;
    }
    const first = suggestions[0];
    if (first) {
      go(first.latitude, first.longitude, first.label);
      return;
    }
    setGeoMessage("Choose a suggested place, or use your current location.");
  }

  function useLocation() {
    if (!navigator.geolocation) {
      setGeoMessage("This browser does not support geolocation. Search by place name instead.");
      return;
    }
    setGeoMessage("Waiting for location permission…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = roundCoordinate(position.coords.latitude);
        const lng = roundCoordinate(position.coords.longitude);
        setGeoMessage(null);
        go(lat, lng, "Near you");
      },
      () => {
        setGeoMessage("Location permission was denied. Search or pick a place from the suggestions.");
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  return (
    <section className="relative isolate min-h-[78vh] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero.png"
        alt="Villaryan hillside villa overlooking the sea at sunset"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-900/75 via-ink-900/45 to-transparent" />
      <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 py-16 sm:px-6 lg:justify-center">
        <p className="text-sm uppercase tracking-[0.2em] text-sand-100">Location first</p>
        <h1 className="mt-3 max-w-xl font-serif text-5xl text-white sm:text-6xl">Find Your Place.</h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-sand-100">
          Discover villas, stays, homes, and properties for sale around the places that matter to you.
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-8 max-w-2xl rounded-2xl bg-white/95 p-4 shadow-card backdrop-blur"
          role="search"
        >
          <label htmlFor="where" className="text-xs font-medium uppercase tracking-wide text-ink-700">
            Where?
          </label>
          <input
            id="where"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Where do you want to be?"
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-ink-900"
          />
          {suggestions.length > 0 ? (
            <ul className="mt-2 overflow-hidden rounded-xl border border-sand-200 bg-white" role="listbox">
              {suggestions.map((item) => (
                <li key={`${item.label}-${item.latitude}`}>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-sm hover:bg-sand-100"
                    onClick={() => {
                      setQuery(item.label);
                      setSelected(item);
                      setSuggestions([]);
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <fieldset className="mt-4">
            <legend className="text-xs font-medium uppercase tracking-wide text-ink-700">Rent or sale</legend>
            <div className="mt-2 flex gap-2">
              {(["RENT", "SALE"] as const).map((value) => (
                <label
                  key={value}
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm ${
                    intent === value ? "bg-forest-800 text-white" : "bg-sand-100 text-ink-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="intent"
                    value={value}
                    checked={intent === value}
                    onChange={() => setIntent(value)}
                    className="sr-only"
                  />
                  {value === "RENT" ? "Rent" : "Buy"}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-forest-800 px-5 py-2.5 text-sm text-white hover:bg-forest-900"
            >
              Explore Properties
            </button>
            <button
              type="button"
              onClick={useLocation}
              className="rounded-full border border-sand-300 px-5 py-2.5 text-sm text-ink-800"
            >
              Use current location
            </button>
          </div>
          {geoMessage ? <p className="mt-3 text-sm text-ink-700">{geoMessage}</p> : null}
        </form>
      </div>
    </section>
  );
}
