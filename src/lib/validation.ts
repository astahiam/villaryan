import { z } from "zod";
import { DEFAULT_RADIUS_METERS, MAX_RADIUS_METERS } from "./constants";

export const searchParamsSchema = z.object({
  q: z.string().trim().max(200).optional(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  intent: z.enum(["RENT", "SALE"]).default("RENT"),
  category: z.enum(["VILLA", "HOTEL", "HOUSE", "APARTMENT", "LAND", "BOARDING_HOUSE"]).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  radiusMeters: z.coerce.number().min(500).max(MAX_RADIUS_METERS).default(DEFAULT_RADIUS_METERS),
  sort: z.enum(["distance", "price_asc", "price_desc"]).default("distance"),
  page: z.coerce.number().int().min(1).default(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.coerce.number().int().min(1).max(16).optional(),
});

export const listingSchema = z.object({
  title: z.string().trim().min(5).max(120),
  category: z.enum(["VILLA", "HOTEL", "HOUSE", "APARTMENT", "LAND", "BOARDING_HOUSE"]),
  intent: z.enum(["RENT", "SALE"]),
  priceAmount: z.coerce.number().positive().max(1_000_000_000_000),
  currency: z.enum(["IDR", "USD"]).default("IDR"),
  pricePeriod: z.enum(["NIGHT", "MONTH", "YEAR", "TOTAL"]).optional(),
  description: z.string().trim().min(40).max(4000),
  amenities: z.array(z.string().min(2).max(40)).max(20).default([]),
  approximateAddress: z.string().trim().min(5).max(200),
  locationLabel: z.string().trim().min(2).max(120),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  displayName: z.string().trim().min(2).max(80),
  preferredMethod: z.enum(["WHATSAPP", "PHONE", "EMAIL"]),
  whatsapp: z.string().trim().max(20).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
}).superRefine((value, ctx) => {
  if (value.preferredMethod === "WHATSAPP" && !value.whatsapp) {
    ctx.addIssue({ code: "custom", message: "WhatsApp number is required", path: ["whatsapp"] });
  }
  if (value.preferredMethod === "PHONE" && !value.phone) {
    ctx.addIssue({ code: "custom", message: "Phone number is required", path: ["phone"] });
  }
  if (value.preferredMethod === "EMAIL" && !value.email) {
    ctx.addIssue({ code: "custom", message: "Email is required", path: ["email"] });
  }
  if (value.intent === "RENT" && !value.pricePeriod) {
    ctx.addIssue({ code: "custom", message: "Rental period is required", path: ["pricePeriod"] });
  }
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const moderationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().trim().max(500).optional(),
});
