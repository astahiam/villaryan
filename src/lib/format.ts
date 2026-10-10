import type { NormalizedProperty } from "./types";

const currencyDisplay: Record<string, string> = {
  IDR: "IDR",
  USD: "USD",
  EUR: "EUR",
};

export function formatMoney(amount: number | null, currency: string): string | null {
  if (amount == null) return null;
  const code = currencyDisplay[currency] ?? currency;
  if (code === "IDR") {
    return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPrice(property: NormalizedProperty): string {
  if (property.priceLabel) return property.priceLabel;
  const money = formatMoney(property.priceAmount, property.currency);
  if (!money) return "Price on request";
  if (property.pricePeriod === "NIGHT") return `${money} / night`;
  if (property.pricePeriod === "MONTH") return `${money} / month`;
  if (property.pricePeriod === "YEAR") return `${money} / year`;
  return money;
}

export function categoryLabel(value: string): string {
  const map: Record<string, string> = {
    VILLA: "Villa",
    HOTEL: "Hotel / stay",
    HOUSE: "House",
    APARTMENT: "Apartment",
    LAND: "Land",
    BOARDING_HOUSE: "Boarding house",
  };
  return map[value] ?? value;
}

export function sourceLabel(source: NormalizedProperty["source"], isFixture: boolean): string {
  if (isFixture || source === "MOCK") return "Development fixture";
  if (source === "LOCAL") return "Owner listing";
  if (source === "STAYAPI_BOOKING") return "StayAPI · Booking.com inventory";
  if (source === "STAYAPI_AIRBNB") return "StayAPI · Airbnb inventory";
  return "External listing";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72);
}
