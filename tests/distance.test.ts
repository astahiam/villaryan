import { describe, expect, it } from "vitest";
import { formatDistance, haversineMeters, roundCoordinate } from "@/lib/geo/distance";

describe("geo helpers", () => {
  it("computes a plausible Ubud–Canggu distance", () => {
    const meters = haversineMeters(-8.5069, 115.2625, -8.6478, 115.1385);
    expect(meters).toBeGreaterThan(15000);
    expect(meters).toBeLessThan(30000);
  });

  it("rounds coordinates so public URLs are not precise", () => {
    expect(roundCoordinate(-8.5069123)).toBe(-8.507);
  });

  it("labels straight-line distance", () => {
    expect(formatDistance(250)).toContain("straight-line");
    expect(formatDistance(2500)).toContain("km");
  });
});
