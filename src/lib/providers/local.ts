import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { haversineMeters } from "../geo/distance";
import { formatMoney, sourceLabel } from "../format";
import type { InventoryProvider } from "./types";
import type { NormalizedProperty, SearchQuery } from "../types";

function toNumber(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : Number(value.toString());
}

export function mapLocalProperty(
  property: {
    id: string;
    title: string;
    category: NormalizedProperty["category"];
    intent: NormalizedProperty["intent"];
    description: string;
    amenities: string[];
    priceAmount: { toString(): string } | number;
    currency: string;
    pricePeriod: NormalizedProperty["pricePeriod"];
    latitude: { toString(): string } | number;
    longitude: { toString(): string } | number;
    locationLabel: string;
    approximateAddress: string;
    source: NormalizedProperty["source"];
    sourceRef: string | null;
    externalUrl: string | null;
    isFixture: boolean;
    verified: boolean;
    images: { url: string; alt: string; attribution: string | null }[];
    contact: NormalizedProperty["contact"] | null;
  },
  origin?: { lat: number; lng: number },
): NormalizedProperty {
  const lat = toNumber(property.latitude);
  const lng = toNumber(property.longitude);
  const amount = toNumber(property.priceAmount);
  return {
    id: `local_${property.id}`,
    source: property.source,
    sourceRef: property.sourceRef ?? property.id,
    title: property.title,
    category: property.category,
    intent: property.intent,
    description: property.description,
    amenities: property.amenities,
    priceAmount: amount,
    currency: property.currency,
    pricePeriod: property.pricePeriod,
    priceLabel: formatMoney(amount, property.currency),
    latitude: lat,
    longitude: lng,
    locationLabel: property.locationLabel,
    approximateAddress: property.approximateAddress,
    images: property.images,
    distanceMeters: origin ? Math.round(haversineMeters(origin.lat, origin.lng, lat, lng)) : null,
    contact: property.contact,
    externalUrl: property.externalUrl,
    isFixture: property.isFixture,
    verified: property.verified,
    listingSourceLabel: sourceLabel(property.source, property.isFixture),
  };
}

const include = {
  images: { orderBy: { sortOrder: "asc" as const } },
  contact: true,
};

export const localProvider: InventoryProvider = {
  id: "local",
  label: "Owner listings",
  async search(query: SearchQuery) {
    const where: Prisma.PropertyWhereInput = {
      status: "APPROVED",
      intent: query.intent,
      ...(query.category ? { category: query.category } : {}),
      ...(query.minPrice != null || query.maxPrice != null
        ? {
            priceAmount: {
              ...(query.minPrice != null ? { gte: query.minPrice } : {}),
              ...(query.maxPrice != null ? { lte: query.maxPrice } : {}),
            },
          }
        : {}),
    };

    try {
      const rows = await prisma.$queryRaw<Array<{ id: string; distance_meters: number }>>`
        SELECT p.id,
          ST_Distance(p.geom, ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography) AS distance_meters
        FROM "Property" p
        WHERE p.status = 'APPROVED'
          AND p.intent = ${query.intent}::"TransactionIntent"
          AND (${query.category}::"PropertyCategory" IS NULL OR p.category = ${query.category}::"PropertyCategory")
          AND (${query.minPrice}::numeric IS NULL OR p."priceAmount" >= ${query.minPrice})
          AND (${query.maxPrice}::numeric IS NULL OR p."priceAmount" <= ${query.maxPrice})
          AND ST_DWithin(p.geom, ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography, ${query.radiusMeters})
        ORDER BY distance_meters ASC
        LIMIT 80
      `;
      const ids = rows.map((row) => row.id);
      const hydrated = await prisma.property.findMany({
        where: { id: { in: ids } },
        include,
      });
      const distanceById = new Map(rows.map((row) => [row.id, Number(row.distance_meters)]));
      const results = hydrated
        .map((property) => {
          const mapped = mapLocalProperty(property, { lat: query.lat, lng: query.lng });
          mapped.distanceMeters = Math.round(distanceById.get(property.id) ?? mapped.distanceMeters ?? 0);
          return mapped;
        })
        .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
      return {
        results,
        status: { id: "local", label: "Owner listings", status: "ok" },
      };
    } catch {
      const fallback = await prisma.property.findMany({ where, include, take: 80 });
      const results = fallback
        .map((property) => mapLocalProperty(property, { lat: query.lat, lng: query.lng }))
        .filter((item) => (item.distanceMeters ?? 0) <= query.radiusMeters);
      return {
        results,
        status: {
          id: "local",
          label: "Owner listings",
          status: "ok",
          detail: "PostGIS radius query unavailable; used straight-line fallback",
        },
      };
    }
  },
  async getById(id) {
    const rawId = id.startsWith("local_") ? id.slice(6) : id;
    const property = await prisma.property.findFirst({
      where: { id: rawId, status: "APPROVED" },
      include,
    });
    return property ? mapLocalProperty(property) : null;
  },
};
