import { notFound } from "next/navigation";
import { HostAction } from "@/components/property/HostAction";
import { LocationAwareness } from "@/components/property/LocationAwareness";
import { categoryLabel, formatPrice, sourceLabel } from "@/lib/format";
import { getPropertyByCompositeId } from "@/lib/search/service";
import { roundCoordinate } from "@/lib/geo/distance";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ originLat?: string; originLng?: string; from?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const property = await getPropertyByCompositeId(decodeURIComponent(id));
  return { title: property?.title ?? "Property" };
}

export default async function PropertyPage({ params, searchParams }: Props) {
  const { id } = await params;
  const extras = await searchParams;
  const property = await getPropertyByCompositeId(decodeURIComponent(id));
  if (!property) notFound();

  const originLat = extras.originLat ? roundCoordinate(Number(extras.originLat)) : undefined;
  const originLng = extras.originLng ? roundCoordinate(Number(extras.originLng)) : undefined;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-sm text-forest-800">
        {categoryLabel(property.category)} · {property.intent === "SALE" ? "For sale" : "For rent"}
      </p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">{property.title}</h1>
      <p className="mt-2 text-ink-700">{property.locationLabel}</p>
      <p className="mt-1 text-lg font-medium">{formatPrice(property)}</p>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {property.images.map((image) => (
          <figure key={image.url} className="overflow-hidden rounded-2xl bg-sand-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt={image.alt} className="h-80 w-full object-cover" />
            {image.attribution ? (
              <figcaption className="px-3 py-2 text-xs text-ink-700">{image.attribution}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <section>
            <h2 className="font-serif text-3xl">About this place</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink-800">{property.description}</p>
          </section>
          {property.amenities.length > 0 ? (
            <section>
              <h2 className="font-serif text-2xl">Amenities</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((item) => (
                  <li key={item} className="rounded-full bg-sand-100 px-3 py-1 text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section>
            <h2 className="font-serif text-2xl">Location</h2>
            <p className="mt-2 text-sm text-ink-700">{property.approximateAddress}</p>
            <p className="mt-1 text-xs text-ink-700">
              Pin shown at the listing coordinates for map context. Owner contact records do not expose a public GPS URL.
            </p>
          </section>
          {property.availabilityNote ? (
            <p className="rounded-xl bg-sand-100 p-4 text-sm">{property.availabilityNote}</p>
          ) : null}
          <p className="text-sm text-ink-700">
            Source: {sourceLabel(property.source, property.isFixture)}
            {property.verified ? " · Independently verified" : " · Not independently verified"}
          </p>
        </div>
        <HostAction property={property} />
      </div>

      <div className="mt-10">
        <LocationAwareness
          latitude={property.latitude}
          longitude={property.longitude}
          locationLabel={property.locationLabel}
          originLat={Number.isFinite(originLat) ? originLat : undefined}
          originLng={Number.isFinite(originLng) ? originLng : undefined}
        />
      </div>
    </article>
  );
}
