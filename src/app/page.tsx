import Link from "next/link";
import { CategoryShortcuts } from "@/components/home/CategoryShortcuts";
import { FourSteps } from "@/components/home/FourSteps";
import { SearchHero } from "@/components/home/SearchHero";
import { PropertyCard } from "@/components/property/PropertyCard";
import { prisma } from "@/lib/db";
import { mapLocalProperty } from "@/lib/providers/local";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featured: ReturnType<typeof mapLocalProperty>[] = [];
  try {
    const rows = await prisma.property.findMany({
      where: { status: "APPROVED" },
      include: { images: { orderBy: { sortOrder: "asc" } }, contact: true },
      take: 6,
      orderBy: { publishedAt: "desc" },
    });
    featured = rows.map((row) => mapLocalProperty(row));
  } catch {
    featured = [];
  }

  return (
    <>
      <SearchHero />
      <FourSteps />
      <CategoryShortcuts />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-3xl">Featured places</h2>
          <Link href="/search?q=Ubud&lat=-8.507&lng=115.262&intent=RENT" className="text-sm text-forest-800">
            View all
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-sand-200 bg-white p-6 text-sm text-ink-700">
            Featured listings appear after the database is migrated and seeded. Local search still works once
            PostgreSQL is running.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
