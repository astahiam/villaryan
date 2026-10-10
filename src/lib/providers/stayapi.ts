import { getEnv, stayApiConfigured } from "../env";
import { cacheGet, cacheSet } from "../cache";
import { haversineMeters } from "../geo/distance";
import { sanitizeExternalUrl } from "../links";
import { mockStayProvider } from "./mock";
import type { InventoryProvider } from "./types";
import type { NormalizedProperty, ProviderStatus, SearchQuery } from "../types";

const CACHE_TTL_MS = 10 * 60 * 1000;

type StayHotel = {
  hotel_id?: string;
  name?: string;
  address?: string;
  city?: string;
  display_location?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  price?: { amount?: number; currency?: string; display?: string } | null;
  rating?: { score?: number; display?: string } | null;
};

type StayAirbnbListing = {
  listing_id?: string;
  url?: string;
  title?: string;
  name?: string;
  image_url?: string;
  displayed_price?: string;
  price_currency?: string | null;
  price_applies_to_requested_dates?: boolean;
};

async function stayFetch(path: string, params: Record<string, string | number | undefined>) {
  const env = getEnv();
  const url = new URL(path, env.STAYAPI_BASE_URL.endsWith("/") ? env.STAYAPI_BASE_URL : `${env.STAYAPI_BASE_URL}/`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, {
    headers: {
      "x-api-key": env.STAYAPI_API_KEY,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(env.STAYAPI_TIMEOUT_MS),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`StayAPI ${response.status}`);
  }
  return body;
}

function logProvider(event: string, extra: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      service: "villaryan",
      provider: "stayapi",
      event,
      ...extra,
    }),
  );
}

function mapHotel(hotel: StayHotel, query: SearchQuery): NormalizedProperty | null {
  if (!hotel.hotel_id || !hotel.name || hotel.latitude == null || hotel.longitude == null) {
    return null;
  }
  const amount = hotel.price?.amount ?? null;
  return {
    id: `stayapi-booking_${hotel.hotel_id}`,
    source: "STAYAPI_BOOKING",
    sourceRef: String(hotel.hotel_id),
    title: hotel.name,
    category: "HOTEL",
    intent: "RENT",
    description: `Short-stay hotel inventory from StayAPI (Booking.com search). Location shown as reported by the provider. Pricing may depend on dates and occupancy.`,
    amenities: [],
    priceAmount: amount,
    currency: hotel.price?.currency ?? "USD",
    pricePeriod: "NIGHT",
    priceLabel: hotel.price?.display ?? null,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    locationLabel: hotel.display_location || hotel.city || query.q || "Unknown area",
    approximateAddress: hotel.address || hotel.display_location || "Approximate location from provider",
    images: hotel.image_url
      ? [{ url: hotel.image_url, alt: hotel.name, attribution: "Provider image" }]
      : [{ url: "/images/hero.png", alt: hotel.name }],
    distanceMeters: Math.round(
      haversineMeters(query.lat, query.lng, hotel.latitude, hotel.longitude),
    ),
    contact: null,
    externalUrl: sanitizeExternalUrl(
      `https://www.booking.com/hotel.html?aid=304142&hotel_id=${hotel.hotel_id}`,
    ),
    isFixture: false,
    verified: false,
    listingSourceLabel: "StayAPI · Booking.com inventory",
    availabilityNote: query.checkIn
      ? "Quoted for the requested dates when the provider returned a price. Booking continues on the external site."
      : "Dates were not supplied. Open the provider to confirm live rates and availability.",
  };
}

function mapAirbnb(listing: StayAirbnbListing, query: SearchQuery): NormalizedProperty | null {
  if (!listing.listing_id || !(listing.title || listing.name)) return null;
  const url = sanitizeExternalUrl(listing.url ?? `https://www.airbnb.com/rooms/${listing.listing_id}`);
  return {
    id: `stayapi-airbnb_${listing.listing_id}`,
    source: "STAYAPI_AIRBNB",
    sourceRef: String(listing.listing_id),
    title: listing.title || listing.name || "Airbnb listing",
    category: "HOTEL",
    intent: "RENT",
    description:
      "Short-stay listing from StayAPI Airbnb destination search. StayAPI does not confirm availability on this endpoint.",
    amenities: [],
    priceAmount: null,
    currency: listing.price_currency ?? "USD",
    pricePeriod: "NIGHT",
    priceLabel: listing.displayed_price ?? null,
    latitude: query.lat + (hashOffset(listing.listing_id) % 80) / 10000,
    longitude: query.lng + (hashOffset(listing.listing_id, 7) % 80) / 10000,
    locationLabel: query.q || "Search area",
    approximateAddress: "Approximate area from destination search (listing coordinates are not always provided)",
    images: listing.image_url
      ? [{ url: listing.image_url, alt: listing.title || "Stay", attribution: "Provider image" }]
      : [{ url: "/images/hero.png", alt: listing.title || "Stay" }],
    distanceMeters: null,
    contact: null,
    externalUrl: url,
    isFixture: false,
    verified: false,
    listingSourceLabel: "StayAPI · Airbnb inventory",
    availabilityNote:
      "StayAPI marks availability_verified=false for destination search. Coordinates are approximate because this endpoint does not always return lat/lng.",
  };
}

function hashOffset(value: string, salt = 3): number {
  let hash = salt;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 1000;
  return hash;
}

const liveProvider: InventoryProvider = {
  id: "stayapi",
  label: "StayAPI",
  async search(query) {
    if (query.intent !== "RENT") {
      return {
        results: [],
        status: {
          id: "stayapi",
          label: "StayAPI",
          status: "skipped",
          detail: "StayAPI is used for short-stay / rent searches only",
        },
      };
    }
    if (query.category && query.category !== "HOTEL" && query.category !== "VILLA" && query.category !== "APARTMENT") {
      return {
        results: [],
        status: {
          id: "stayapi",
          label: "StayAPI",
          status: "skipped",
          detail: "StayAPI is not used for land, houses for sale, or boarding houses",
        },
      };
    }

    const cacheKey = `stayapi:${query.lat}:${query.lng}:${query.checkIn ?? ""}:${query.q ?? ""}`;
    const cached = cacheGet<{ results: NormalizedProperty[]; status: ProviderStatus }>(cacheKey);
    if (cached) return cached;

    const locationName = query.q || "selected area";
    const collected: NormalizedProperty[] = [];
    const notes: string[] = [];

    try {
      const lookup = await stayFetch("/v1/booking/destinations/lookup", { query: locationName });
      const destId = lookup?.dest_id ?? lookup?.data?.dest_id;
      const destType = lookup?.dest_type ?? lookup?.data?.dest_type ?? "CITY";
      if (destId) {
        const search = await stayFetch("/v1/booking/search", {
          dest_id: destId,
          dest_type: destType,
          checkin: query.checkIn,
          checkout: query.checkOut,
          adults: query.adults ?? 2,
          rooms: 1,
          rows_per_page: 15,
          market: "ID",
          currency: "USD",
        });
        const hotels = (search?.data?.hotels ?? search?.hotels ?? []) as StayHotel[];
        for (const hotel of hotels) {
          const mapped = mapHotel(hotel, query);
          if (mapped) collected.push(mapped);
        }
        logProvider("booking_search_ok", { count: hotels.length, destId: String(destId) });
      } else {
        notes.push("No Booking.com dest_id for this location");
      }
    } catch (error) {
      notes.push("Hotel search unavailable");
      logProvider("booking_search_error", { message: error instanceof Error ? error.message : "error" });
    }

    try {
      const airbnb = await stayFetch("/v1/airbnb/search", {
        location: locationName,
        check_in: query.checkIn,
        check_out: query.checkOut,
        adults: query.adults ?? 2,
        currency: "USD",
      });
      const listings = (airbnb?.listings ?? airbnb?.data?.listings ?? []) as StayAirbnbListing[];
      for (const listing of listings.slice(0, 10)) {
        const mapped = mapAirbnb(listing, query);
        if (mapped) collected.push(mapped);
      }
      logProvider("airbnb_search_ok", { count: listings.length });
    } catch (error) {
      notes.push("Airbnb search unavailable");
      logProvider("airbnb_search_error", { message: error instanceof Error ? error.message : "error" });
    }

    const status: ProviderStatus = {
      id: "stayapi",
      label: "StayAPI",
      status: collected.length || notes.length === 0 ? "ok" : "error",
      detail: notes.join(". ") || undefined,
    };
    const payload = { results: collected, status };
    cacheSet(cacheKey, payload, CACHE_TTL_MS);
    return payload;
  },
  async getById(id, query) {
    if (id.startsWith("stayapi-booking_")) {
      const hotelId = id.replace("stayapi-booking_", "");
      const env = getEnv();
      try {
        const meta = await stayFetch("/v1/meta/search", {
          hotel_name: hotelId,
          location: query ? "Indonesia" : "Indonesia",
        });
        const links = meta?.data?.links ?? {};
        const external =
          sanitizeExternalUrl(links.booking_com) ||
          sanitizeExternalUrl(links.official_website) ||
          sanitizeExternalUrl(`https://www.booking.com/searchresults.html?ss=${hotelId}`);
        return {
          id,
          source: "STAYAPI_BOOKING",
          sourceRef: hotelId,
          title: meta?.data?.hotel_name || `Hotel ${hotelId}`,
          category: "HOTEL",
          intent: "RENT",
          description:
            "Hotel inventory retrieved via StayAPI. Booking, dates, and payment are completed on the external provider. This is not a Villaryan reservation.",
          amenities: [],
          priceAmount: null,
          currency: "USD",
          pricePeriod: "NIGHT",
          priceLabel: null,
          latitude: -8.65,
          longitude: 115.22,
          locationLabel: meta?.data?.location || "Provider location",
          approximateAddress: meta?.data?.location || "See provider listing",
          images: [{ url: "/images/hero.png", alt: meta?.data?.hotel_name || "Hotel" }],
          distanceMeters: null,
          contact: null,
          externalUrl: external,
          isFixture: false,
          verified: false,
          listingSourceLabel: "StayAPI · Booking.com inventory",
          availabilityNote: "Use the provider link for live rates. StayAPI meta search returns booking URLs, not a full property record.",
        };
      } catch {
        logProvider("meta_search_error", { hotelId, timeoutMs: env.STAYAPI_TIMEOUT_MS });
        return null;
      }
    }

    if (id.startsWith("stayapi-airbnb_")) {
      const listingId = id.replace("stayapi-airbnb_", "");
      if (!query?.checkIn || !query.checkOut) {
        return {
          id,
          source: "STAYAPI_AIRBNB",
          sourceRef: listingId,
          title: `Airbnb listing ${listingId}`,
          category: "HOTEL",
          intent: "RENT",
          description:
            "StayAPI listing details require check-in and check-out dates. Continue on Airbnb to choose dates and complete a booking.",
          amenities: [],
          priceAmount: null,
          currency: "USD",
          pricePeriod: "NIGHT",
          priceLabel: null,
          latitude: -8.65,
          longitude: 115.22,
          locationLabel: "Airbnb listing",
          approximateAddress: "See provider listing",
          images: [{ url: "/images/hero.png", alt: "Airbnb listing" }],
          distanceMeters: null,
          contact: null,
          externalUrl: sanitizeExternalUrl(`https://www.airbnb.com/rooms/${listingId}`),
          isFixture: false,
          verified: false,
          listingSourceLabel: "StayAPI · Airbnb inventory",
          availabilityNote:
            "GET /v1/airbnb/listing/{id}/details requires dates. Without dates, Villaryan only shows a handoff to Airbnb.",
        };
      }
      try {
        const details = await stayFetch(`/v1/airbnb/listing/${listingId}/details`, {
          check_in: query.checkIn,
          check_out: query.checkOut,
          adults: query.adults ?? 2,
        });
        const info = details?.details ?? {};
        return {
          id,
          source: "STAYAPI_AIRBNB",
          sourceRef: listingId,
          title: info.title || `Airbnb listing ${listingId}`,
          category: "HOTEL",
          intent: "RENT",
          description: `Hosted by ${info.host_name ?? "the listing host"}. Guest capacity ${info.max_guests ?? "unknown"}. Booking continues on Airbnb; Villaryan does not process payment.`,
          amenities: [],
          priceAmount: null,
          currency: "USD",
          pricePeriod: "NIGHT",
          priceLabel: null,
          latitude: -8.65,
          longitude: 115.22,
          locationLabel: "Airbnb listing",
          approximateAddress: "See provider listing for the published address",
          images: info.image_url
            ? [{ url: info.image_url, alt: info.title || "Stay", attribution: "Provider image" }]
            : [{ url: "/images/hero.png", alt: info.title || "Stay" }],
          distanceMeters: null,
          contact: null,
          externalUrl: sanitizeExternalUrl(`https://www.airbnb.com/rooms/${listingId}`),
          isFixture: false,
          verified: false,
          listingSourceLabel: "StayAPI · Airbnb inventory",
        };
      } catch {
        return null;
      }
    }
    return null;
  },
};

export function getStayProvider(): InventoryProvider {
  return stayApiConfigured() ? liveProvider : mockStayProvider;
}
