import { describe, expect, it } from "vitest";
import { rankProperties } from "@/lib/search/rank";
import type { NormalizedProperty, SearchQuery } from "@/lib/types";

const base = (overrides: Partial<NormalizedProperty>): NormalizedProperty => ({
  id: "a",
  source: "LOCAL",
  sourceRef: "a",
  title: "A",
  category: "VILLA",
  intent: "RENT",
  description: "",
  amenities: [],
  priceAmount: 100,
  currency: "USD",
  pricePeriod: "NIGHT",
  priceLabel: null,
  latitude: -8.5,
  longitude: 115.2,
  locationLabel: "Ubud",
  approximateAddress: "Ubud",
  images: [],
  distanceMeters: 1000,
  contact: null,
  externalUrl: null,
  isFixture: false,
  verified: false,
  listingSourceLabel: "Owner listing",
  ...overrides,
});

const query: SearchQuery = {
  lat: -8.5,
  lng: 115.2,
  intent: "RENT",
  radiusMeters: 15000,
  sort: "distance",
  page: 1,
};

describe("ranking", () => {
  it("orders by distance by default", () => {
    const ranked = rankProperties(
      [base({ id: "far", title: "Far", distanceMeters: 9000 }), base({ id: "near", title: "Near", distanceMeters: 200 })],
      query,
    );
    expect(ranked[0]?.id).toBe("near");
  });

  it("can sort by price", () => {
    const ranked = rankProperties(
      [base({ id: "exp", priceAmount: 400 }), base({ id: "cheap", priceAmount: 40 })],
      { ...query, sort: "price_asc" },
    );
    expect(ranked[0]?.id).toBe("cheap");
  });
});
