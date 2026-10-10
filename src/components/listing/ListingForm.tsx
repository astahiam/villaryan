"use client";

import { FormEvent, useState } from "react";
import { AMENITY_OPTIONS, CATEGORIES } from "@/lib/constants";

export function ListingForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setStatus(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/listings", { method: "POST", body: form });
    const payload = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "Submission failed.");
      return;
    }
    setStatus("Submitted for moderation. It will not appear in search until an editor approves it.");
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-sand-200 bg-white p-6" encType="multipart/form-data">
      <label className="block text-sm">
        Title
        <input name="title" required minLength={5} className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Category
          <select name="category" required className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2">
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Intent
          <select name="intent" required className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2">
            <option value="RENT">Rent</option>
            <option value="SALE">Sale</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm">
          Price
          <input name="priceAmount" type="number" min={1} required className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          Currency
          <select name="currency" className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2">
            <option value="IDR">IDR</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label className="text-sm">
          Rental period
          <select name="pricePeriod" className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2">
            <option value="MONTH">Monthly</option>
            <option value="NIGHT">Nightly</option>
            <option value="YEAR">Yearly</option>
            <option value="TOTAL">Total (sale)</option>
          </select>
        </label>
      </div>
      <label className="block text-sm">
        Description
        <textarea name="description" required minLength={40} rows={5} className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
      </label>
      <fieldset>
        <legend className="text-sm">Amenities</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
          {AMENITY_OPTIONS.map((item) => (
            <label key={item} className="text-sm">
              <input type="checkbox" name="amenities" value={item} className="mr-2" />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm">
        Area label
        <input name="locationLabel" placeholder="Ubud, Bali" required className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
      </label>
      <label className="block text-sm">
        Approximate address
        <input name="approximateAddress" required className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Latitude
          <input name="latitude" type="number" step="0.0001" required className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          Longitude
          <input name="longitude" type="number" step="0.0001" required className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
        </label>
      </div>
      <p className="text-xs text-ink-700">
        Use an approximate pin. Precise owner coordinates are stored for search and are not published in listing URLs.
      </p>
      <label className="block text-sm">
        Photos (JPEG, PNG, or WebP, max 6 MB each)
        <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="mt-1 w-full text-sm" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Contact name
          <input name="displayName" required className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          Preferred contact
          <select name="preferredMethod" className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2">
            <option value="WHATSAPP">WhatsApp</option>
            <option value="PHONE">Phone</option>
            <option value="EMAIL">Email</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm">
          WhatsApp
          <input name="whatsapp" placeholder="62812..." className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          Phone
          <input name="phone" className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          Email
          <input name="email" type="email" className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
        </label>
      </div>
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
      {status ? <p className="text-sm text-forest-800">{status}</p> : null}
      <button disabled={pending} className="rounded-full bg-forest-800 px-5 py-2.5 text-sm text-white disabled:opacity-60">
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
