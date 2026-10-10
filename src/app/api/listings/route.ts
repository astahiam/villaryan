import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { listingSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import { storeImage } from "@/lib/storage";
import { slugify } from "@/lib/format";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { MAX_IMAGES_PER_LISTING } from "@/lib/constants";
import type { CategoryValue } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const limited = rateLimit(`listing:${clientKey(request)}`, 8, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Submission limit reached. Try later." }, { status: 429 });
  }

  const form = await request.formData();
  const amenities = form.getAll("amenities").map(String);
  const parsed = listingSchema.safeParse({
    title: form.get("title"),
    category: form.get("category"),
    intent: form.get("intent"),
    priceAmount: form.get("priceAmount"),
    currency: form.get("currency") || "IDR",
    pricePeriod: form.get("pricePeriod") || undefined,
    description: form.get("description"),
    amenities,
    approximateAddress: form.get("approximateAddress"),
    locationLabel: form.get("locationLabel"),
    latitude: form.get("latitude"),
    longitude: form.get("longitude"),
    displayName: form.get("displayName"),
    preferredMethod: form.get("preferredMethod"),
    whatsapp: form.get("whatsapp") || undefined,
    phone: form.get("phone") || undefined,
    email: form.get("email") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the form and try again." },
      { status: 400 },
    );
  }

  const photos = form.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  if (photos.length > MAX_IMAGES_PER_LISTING) {
    return NextResponse.json({ error: "You can upload up to 8 photos." }, { status: 400 });
  }

  const stored: string[] = [];
  try {
    for (const photo of photos) {
      stored.push(await storeImage(photo));
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Photo upload failed." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const slug = `${slugify(data.title)}-${Date.now().toString(36)}`;
  const created = await prisma.property.create({
    data: {
      title: data.title,
      slug,
      category: data.category as CategoryValue,
      intent: data.intent,
      description: data.description,
      amenities: data.amenities,
      priceAmount: new Prisma.Decimal(data.priceAmount),
      currency: data.currency,
      pricePeriod: data.intent === "SALE" ? "TOTAL" : data.pricePeriod,
      latitude: new Prisma.Decimal(data.latitude),
      longitude: new Prisma.Decimal(data.longitude),
      locationLabel: data.locationLabel,
      approximateAddress: data.approximateAddress,
      source: "LOCAL",
      isFixture: false,
      verified: false,
      status: "PENDING",
      images: {
        create: stored.map((url, index) => ({
          url,
          alt: data.title,
          sortOrder: index,
        })),
      },
      contact: {
        create: {
          displayName: data.displayName,
          preferredMethod: data.preferredMethod,
          whatsapp: data.whatsapp,
          phone: data.phone,
          email: data.email || null,
        },
      },
    },
  });

  return NextResponse.json({ id: created.id, status: created.status });
}
