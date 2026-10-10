import { describe, expect, it } from "vitest";
import { listingSchema, searchParamsSchema } from "@/lib/validation";

describe("validation", () => {
  it("requires a location for search", () => {
    expect(searchParamsSchema.safeParse({ intent: "RENT" }).success).toBe(false);
    expect(searchParamsSchema.safeParse({ lat: -8.5, lng: 115.2, intent: "RENT" }).success).toBe(true);
  });

  it("holds listings in pending by requiring complete owner contact", () => {
    const result = listingSchema.safeParse({
      title: "Short",
      category: "VILLA",
      intent: "RENT",
      priceAmount: 100,
      description: "too short",
      amenities: [],
      approximateAddress: "Ubud",
      locationLabel: "Ubud",
      latitude: -8.5,
      longitude: 115.2,
      displayName: "A",
      preferredMethod: "WHATSAPP",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a complete rental submission", () => {
    const result = listingSchema.safeParse({
      title: "Campuhan Garden Villa",
      category: "VILLA",
      intent: "RENT",
      priceAmount: 25000000,
      currency: "IDR",
      pricePeriod: "MONTH",
      description: "A long enough description of the villa, the area, and how guests should get in touch with the owner.",
      amenities: ["Wifi"],
      approximateAddress: "Campuhan, Ubud",
      locationLabel: "Ubud, Bali",
      latitude: -8.5,
      longitude: 115.26,
      displayName: "Made",
      preferredMethod: "WHATSAPP",
      whatsapp: "628111000111",
    });
    expect(result.success).toBe(true);
  });
});
