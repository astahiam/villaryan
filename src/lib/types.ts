import type { CategoryValue } from "./constants";

export type Intent = "RENT" | "SALE";
export type PropertySourceKind =
  | "LOCAL"
  | "STAYAPI_BOOKING"
  | "STAYAPI_AIRBNB"
  | "MOCK";

export type PricePeriod = "NIGHT" | "MONTH" | "YEAR" | "TOTAL" | null;

export type NormalizedImage = {
  url: string;
  alt: string;
  attribution?: string | null;
};

export type NormalizedContact = {
  displayName: string;
  preferredMethod: "WHATSAPP" | "PHONE" | "EMAIL";
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type NormalizedProperty = {
  id: string;
  source: PropertySourceKind;
  sourceRef: string;
  title: string;
  category: CategoryValue;
  intent: Intent;
  description: string;
  amenities: string[];
  priceAmount: number | null;
  currency: string;
  pricePeriod: PricePeriod;
  priceLabel: string | null;
  latitude: number;
  longitude: number;
  locationLabel: string;
  approximateAddress: string;
  images: NormalizedImage[];
  distanceMeters: number | null;
  contact: NormalizedContact | null;
  externalUrl: string | null;
  isFixture: boolean;
  verified: boolean;
  listingSourceLabel: string;
  availabilityNote?: string | null;
};

export type SearchQuery = {
  q?: string;
  lat: number;
  lng: number;
  intent: Intent;
  category?: CategoryValue;
  minPrice?: number;
  maxPrice?: number;
  radiusMeters: number;
  sort: "distance" | "price_asc" | "price_desc";
  page: number;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
};

export type SearchResponse = {
  results: NormalizedProperty[];
  total: number;
  page: number;
  pageSize: number;
  providers: ProviderStatus[];
  location: { lat: number; lng: number; label: string };
};

export type ProviderStatus = {
  id: string;
  label: string;
  status: "ok" | "mock" | "skipped" | "error";
  detail?: string;
};

export type NearbyPlace = {
  id: string;
  name: string;
  kind: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
};
