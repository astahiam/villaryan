import { haversineMeters } from "../geo/distance";
import type { InventoryProvider } from "./types";
import type { NormalizedProperty, SearchQuery } from "../types";

const FIXTURES: NormalizedProperty[] = [
  {
    id: "mock_canggu-surf-suite",
    source: "MOCK",
    sourceRef: "mock-canggu-1",
    title: "Canggu Surf Suite (fixture)",
    category: "HOTEL",
    intent: "RENT",
    description:
      "A labeled development fixture used when StayAPI credentials are not configured. Not a live or verified listing.",
    amenities: ["Wifi", "Pool", "Near beach"],
    priceAmount: 89,
    currency: "USD",
    pricePeriod: "NIGHT",
    priceLabel: "$89 / night",
    latitude: -8.6492,
    longitude: 115.1371,
    locationLabel: "Canggu, Bali",
    approximateAddress: "Near Batu Bolong, Canggu",
    images: [
      {
        url: "/images/hero.png",
        alt: "Fixture stay in Canggu",
        attribution: "Villaryan development fixture",
      },
    ],
    distanceMeters: null,
    contact: null,
    externalUrl: "https://stayapi.com/docs",
    isFixture: true,
    verified: false,
    listingSourceLabel: "Development fixture",
    availabilityNote: "Fixture only. Availability is not live.",
  },
  {
    id: "mock_ubud-garden-loft",
    source: "MOCK",
    sourceRef: "mock-ubud-1",
    title: "Ubud Garden Loft (fixture)",
    category: "APARTMENT",
    intent: "RENT",
    description:
      "Sample short-stay inventory shown while the StayAPI adapter is running in mock mode.",
    amenities: ["Wifi", "Kitchen", "Garden"],
    priceAmount: 72,
    currency: "USD",
    pricePeriod: "NIGHT",
    priceLabel: "$72 / night",
    latitude: -8.5088,
    longitude: 115.265,
    locationLabel: "Ubud, Bali",
    approximateAddress: "Central Ubud area",
    images: [
      {
        url: "/images/hero.png",
        alt: "Fixture loft in Ubud",
        attribution: "Villaryan development fixture",
      },
    ],
    distanceMeters: null,
    contact: null,
    externalUrl: "https://stayapi.com/docs",
    isFixture: true,
    verified: false,
    listingSourceLabel: "Development fixture",
    availabilityNote: "Fixture only. Availability is not live.",
  },
];

function applyDistance(query: SearchQuery, item: NormalizedProperty): NormalizedProperty {
  return {
    ...item,
    distanceMeters: Math.round(
      haversineMeters(query.lat, query.lng, item.latitude, item.longitude),
    ),
  };
}

export const mockStayProvider: InventoryProvider = {
  id: "stayapi-mock",
  label: "StayAPI mock adapter",
  async search(query) {
    if (query.intent !== "RENT") {
      return {
        results: [],
        status: {
          id: "stayapi-mock",
          label: "StayAPI mock adapter",
          status: "skipped",
          detail: "External stay inventory is used for rent/short-stay only",
        },
      };
    }
    const results = FIXTURES.map((item) => applyDistance(query, item)).filter(
      (item) => (item.distanceMeters ?? 0) <= query.radiusMeters * 1.5,
    );
    return {
      results,
      status: {
        id: "stayapi-mock",
        label: "StayAPI mock adapter",
        status: "mock",
        detail: "STAYAPI_API_KEY is not set. Showing labeled development fixtures.",
      },
    };
  },
  async getById(id) {
    return FIXTURES.find((item) => item.id === id) ?? null;
  },
};
