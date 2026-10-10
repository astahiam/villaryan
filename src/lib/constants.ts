export const CATEGORIES = [
  { value: "VILLA", label: "Villas", description: "Private villas and compounds" },
  { value: "HOTEL", label: "Hotels & stays", description: "Hotels and short-stay rooms" },
  { value: "HOUSE", label: "Houses", description: "Family homes and townhouses" },
  { value: "APARTMENT", label: "Apartments", description: "Flats and serviced apartments" },
  { value: "LAND", label: "Land", description: "Plots for development or holding" },
  { value: "BOARDING_HOUSE", label: "Boarding houses", description: "Kos and shared residences" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const INTENTS = [
  { value: "RENT", label: "Rent" },
  { value: "SALE", label: "Buy" },
] as const;

export const AMENITY_OPTIONS = [
  "Wifi",
  "Pool",
  "Air conditioning",
  "Kitchen",
  "Parking",
  "Workspace",
  "Garden",
  "Ocean view",
  "Mountain view",
  "Security",
  "Furnished",
  "Near beach",
] as const;

export const DEFAULT_RADIUS_METERS = 15000;
export const MAX_RADIUS_METERS = 80000;
export const SEARCH_PAGE_SIZE = 12;
export const COORDINATE_PRECISION = 3;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
export const MAX_IMAGES_PER_LISTING = 8;
