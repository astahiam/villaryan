import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const unsplash = (id: string, alt: string, photographer: string) => ({
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`,
  alt,
  attribution: `Photo by ${photographer} on Unsplash`,
});

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@villaryan.id";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-now";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN" },
    create: { email: adminEmail, passwordHash, role: "ADMIN" },
  });

  await prisma.property.deleteMany({ where: { isFixture: true, source: "LOCAL" } });

  const listings: Array<{
    title: string;
    slug: string;
    category: Prisma.PropertyCreateInput["category"];
    intent: Prisma.PropertyCreateInput["intent"];
    description: string;
    amenities: string[];
    priceAmount: number;
    currency: string;
    pricePeriod: Prisma.PropertyCreateInput["pricePeriod"];
    latitude: number;
    longitude: number;
    locationLabel: string;
    approximateAddress: string;
    city: string;
    region: string;
    status: Prisma.PropertyCreateInput["status"];
    images: { url: string; alt: string; attribution?: string }[];
    contact: { displayName: string; preferredMethod: "WHATSAPP" | "PHONE" | "EMAIL"; whatsapp?: string; phone?: string; email?: string };
  }> = [
    {
      title: "Ridge Villa with Jungle Canopy",
      slug: "ridge-villa-ubud",
      category: "VILLA",
      intent: "RENT",
      description:
        "A four-bedroom ridge villa above the Wos River valley. Open pavilions, a long pool, and walking access toward central Ubud. Listed by the owner for monthly stays.",
      amenities: ["Wifi", "Pool", "Kitchen", "Garden", "Workspace"],
      priceAmount: 45000000,
      currency: "IDR",
      pricePeriod: "MONTH",
      latitude: -8.5112,
      longitude: 115.2598,
      locationLabel: "Ubud, Bali",
      approximateAddress: "Campuhan ridge area, Ubud",
      city: "Ubud",
      region: "Bali",
      status: "APPROVED",
      images: [
        unsplash("photo-1582719478250-c89cae4dc85b", "Villa pool terrace", "Ralph (Ravi) Kayden"),
        { url: "/images/hero.png", alt: "Villaryan villa terrace at dusk" },
      ],
      contact: { displayName: "Made Wirawan", preferredMethod: "WHATSAPP", whatsapp: "628111000111" },
    },
    {
      title: "Batu Bolong Garden House",
      slug: "batu-bolong-garden-house",
      category: "HOUSE",
      intent: "RENT",
      description:
        "Two-bedroom house a short walk from Batu Bolong beach. Courtyard garden, outdoor kitchen, and a studio loft. Intended for medium-term rent, not nightly hotel use.",
      amenities: ["Wifi", "Kitchen", "Parking", "Garden", "Near beach"],
      priceAmount: 28000000,
      currency: "IDR",
      pricePeriod: "MONTH",
      latitude: -8.6471,
      longitude: 115.1362,
      locationLabel: "Canggu, Bali",
      approximateAddress: "Batu Bolong area, Canggu",
      city: "Canggu",
      region: "Bali",
      status: "APPROVED",
      images: [unsplash("photo-1600596542815-ffad4c1539a9", "Tropical house exterior", "Avi Werde")],
      contact: { displayName: "Kadek Sari", preferredMethod: "WHATSAPP", whatsapp: "628111000222" },
    },
    {
      title: "Sanur Shore Apartment",
      slug: "sanur-shore-apartment",
      category: "APARTMENT",
      intent: "RENT",
      description:
        "Bright one-bedroom apartment near the Sanur cycle path. Suitable for a longer stay with a simple kitchen and shared pool.",
      amenities: ["Wifi", "Pool", "Air conditioning", "Kitchen"],
      priceAmount: 18000000,
      currency: "IDR",
      pricePeriod: "MONTH",
      latitude: -8.6855,
      longitude: 115.2621,
      locationLabel: "Sanur, Bali",
      approximateAddress: "Sindhu / Sanur beachfront area",
      city: "Sanur",
      region: "Bali",
      status: "APPROVED",
      images: [unsplash("photo-1502672260266-1c1ef2d93688", "Apartment interior", "Naomi Hebert")],
      contact: { displayName: "PT Shore Stay", preferredMethod: "EMAIL", email: "stay@example.invalid" },
    },
    {
      title: "Uluwatu Cliff Land Parcel",
      slug: "uluwatu-cliff-land",
      category: "LAND",
      intent: "SALE",
      description:
        "Undeveloped land with a distant ocean aspect in the Pecatu area. Buyers should complete independent legal due diligence. Villaryan does not certify title.",
      amenities: ["Ocean view"],
      priceAmount: 12500000000,
      currency: "IDR",
      pricePeriod: "TOTAL",
      latitude: -8.8214,
      longitude: 115.0902,
      locationLabel: "Uluwatu, Bali",
      approximateAddress: "Pecatu, South Bali",
      city: "Pecatu",
      region: "Bali",
      status: "APPROVED",
      images: [unsplash("photo-1507525428034-b723cf961d3e", "Coastal landscape", "Sean Oulashin")],
      contact: { displayName: "Nyoman Land Desk", preferredMethod: "PHONE", phone: "+628111000333" },
    },
    {
      title: "Tegallalang Family House",
      slug: "tegallalang-family-house",
      category: "HOUSE",
      intent: "SALE",
      description:
        "Three-bedroom family house near the rice terraces. Sold as-is by the owner. Not a verified listing beyond editorial review of the submission.",
      amenities: ["Garden", "Parking", "Furnished"],
      priceAmount: 4200000000,
      currency: "IDR",
      pricePeriod: "TOTAL",
      latitude: -8.4319,
      longitude: 115.2794,
      locationLabel: "Tegallalang, Bali",
      approximateAddress: "Tegallalang village area",
      city: "Tegallalang",
      region: "Bali",
      status: "APPROVED",
      images: [unsplash("photo-1568605114967-8130f3a36994", "House facade", "Tyler Joe")],
      contact: { displayName: "Ibu Luh", preferredMethod: "WHATSAPP", whatsapp: "628111000444" },
    },
    {
      title: "Cihampelas Boarding House",
      slug: "cihampelas-kos",
      category: "BOARDING_HOUSE",
      intent: "RENT",
      description:
        "Furnished kos rooms near Cihampelas. Shared kitchen, 24-hour access, and monthly billing. Rooms are not hotel-rated.",
      amenities: ["Wifi", "Parking", "Security"],
      priceAmount: 2500000,
      currency: "IDR",
      pricePeriod: "MONTH",
      latitude: -6.8954,
      longitude: 107.6046,
      locationLabel: "Bandung, West Java",
      approximateAddress: "Cihampelas area, Bandung",
      city: "Bandung",
      region: "West Java",
      status: "APPROVED",
      images: [unsplash("photo-1522708323590-d24dbb6b0267", "Simple rented room", "Kameron Kincade")],
      contact: { displayName: "Pak Andri", preferredMethod: "WHATSAPP", whatsapp: "628111000555" },
    },
    {
      title: "Menteng Garden Apartment",
      slug: "menteng-garden-apartment",
      category: "APARTMENT",
      intent: "SALE",
      description:
        "Two-bedroom apartment in Menteng with a small balcony garden. Intended for purchase, not short stays.",
      amenities: ["Wifi", "Parking", "Security", "Air conditioning"],
      priceAmount: 3800000000,
      currency: "IDR",
      pricePeriod: "TOTAL",
      latitude: -6.1944,
      longitude: 106.832,
      locationLabel: "Menteng, Jakarta",
      approximateAddress: "Menteng, Central Jakarta",
      city: "Jakarta",
      region: "DKI Jakarta",
      status: "APPROVED",
      images: [unsplash("photo-1493809842364-78817add7ffb", "City apartment living room", "RARCHITECTURE")],
      contact: { displayName: "Sinta Realty", preferredMethod: "EMAIL", email: "menteng@example.invalid" },
    },
    {
      title: "Prawirotaman Courtyard Stay",
      slug: "prawirotaman-courtyard",
      category: "HOTEL",
      intent: "RENT",
      description:
        "Small courtyard guesthouse in Prawirotaman. Owner-operated rooms for short stays. Breakfast is arranged directly with the host.",
      amenities: ["Wifi", "Garden", "Air conditioning"],
      priceAmount: 850000,
      currency: "IDR",
      pricePeriod: "NIGHT",
      latitude: -7.8194,
      longitude: 110.3678,
      locationLabel: "Yogyakarta",
      approximateAddress: "Prawirotaman, Yogyakarta",
      city: "Yogyakarta",
      region: "Yogyakarta",
      status: "APPROVED",
      images: [unsplash("photo-1566073771259-6a8506099945", "Courtyard hotel", "Jerry Wang")],
      contact: { displayName: "Bu Rina", preferredMethod: "WHATSAPP", whatsapp: "628111000666" },
    },
    {
      title: "Labuan Bajo Hill Villa",
      slug: "labuan-bajo-hill-villa",
      category: "VILLA",
      intent: "RENT",
      description:
        "Three-bedroom hill villa overlooking the harbour. Useful as a base for Komodo trips. Road travel times are not calculated in this listing.",
      amenities: ["Wifi", "Pool", "Kitchen", "Ocean view"],
      priceAmount: 32000000,
      currency: "IDR",
      pricePeriod: "MONTH",
      latitude: -8.486,
      longitude: 119.8875,
      locationLabel: "Labuan Bajo",
      approximateAddress: "Hillside above Labuan Bajo town",
      city: "Labuan Bajo",
      region: "East Nusa Tenggara",
      status: "APPROVED",
      images: [{ url: "/images/hero.png", alt: "Hillside villa with a pool" }],
      contact: { displayName: "Flores Stay Co", preferredMethod: "WHATSAPP", whatsapp: "628111000777" },
    },
    {
      title: "Pending Seminyak Studio",
      slug: "pending-seminyak-studio",
      category: "APARTMENT",
      intent: "RENT",
      description:
        "This seed listing is intentionally left pending so the admin moderation queue is not empty after setup.",
      amenities: ["Wifi", "Air conditioning"],
      priceAmount: 14000000,
      currency: "IDR",
      pricePeriod: "MONTH",
      latitude: -8.6904,
      longitude: 115.1568,
      locationLabel: "Seminyak, Bali",
      approximateAddress: "Oberoi / Seminyak",
      city: "Seminyak",
      region: "Bali",
      status: "PENDING",
      images: [unsplash("photo-1522708323590-d24dbb6b0267", "Studio interior", "Kameron Kincade")],
      contact: { displayName: "Gita", preferredMethod: "EMAIL", email: "gita@example.invalid" },
    },
  ];

  for (const listing of listings) {
    const created = await prisma.property.create({
      data: {
        title: listing.title,
        slug: listing.slug,
        category: listing.category,
        intent: listing.intent,
        description: listing.description,
        amenities: listing.amenities,
        priceAmount: new Prisma.Decimal(listing.priceAmount),
        currency: listing.currency,
        pricePeriod: listing.pricePeriod,
        latitude: new Prisma.Decimal(listing.latitude),
        longitude: new Prisma.Decimal(listing.longitude),
        locationLabel: listing.locationLabel,
        approximateAddress: listing.approximateAddress,
        city: listing.city,
        region: listing.region,
        country: "Indonesia",
        source: "LOCAL",
        isFixture: true,
        verified: false,
        status: listing.status,
        publishedAt: listing.status === "APPROVED" ? new Date() : null,
        images: {
          create: listing.images.map((image, index) => ({
            url: image.url,
            alt: image.alt,
            attribution: image.attribution,
            sortOrder: index,
          })),
        },
        contact: { create: listing.contact },
      },
    });
    console.info(`seeded ${created.slug} (${created.status})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
