import Link from "next/link";
import { categoryLabel, formatPrice } from "@/lib/format";
import { formatDistance } from "@/lib/geo/distance";
import type { NormalizedProperty } from "@/lib/types";

type Props = {
  property: NormalizedProperty;
  hrefExtra?: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

export function PropertyCard({ property, hrefExtra = "", selected, onSelect }: Props) {
  const href = `/properties/${encodeURIComponent(property.id)}${hrefExtra}`;
  return (
    <article
      id={`card-${property.id}`}
      className={`overflow-hidden rounded-2xl border bg-white shadow-card transition ${
        selected ? "border-forest-800 ring-2 ring-forest-800/20" : "border-sand-200"
      }`}
    >
      <Link href={href} className="block" onFocus={() => onSelect?.(property.id)}>
        <div className="relative aspect-[16/10] bg-sand-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={property.images[0]?.url ?? "/images/hero.png"}
            alt={property.images[0]?.alt ?? property.title}
            className="h-full w-full object-cover"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs text-ink-800">
            {categoryLabel(property.category)}
          </span>
          {property.isFixture ? (
            <span className="absolute right-3 top-3 rounded-full bg-sand-100 px-3 py-1 text-xs text-ink-700">
              Fixture
            </span>
          ) : null}
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <button
          type="button"
          onClick={() => onSelect?.(property.id)}
          className="text-left font-serif text-xl text-forest-900"
        >
          {property.title}
        </button>
        <p className="text-sm text-ink-700">{property.locationLabel}</p>
        <p className="text-sm font-medium text-ink-900">{formatPrice(property)}</p>
        <div className="flex flex-wrap gap-2 text-xs text-ink-700">
          {formatDistance(property.distanceMeters) ? (
            <span>{formatDistance(property.distanceMeters)}</span>
          ) : null}
          <span>{property.listingSourceLabel}</span>
        </div>
        <Link href={href} className="inline-flex text-sm text-forest-800 underline-offset-4 hover:underline">
          View details
        </Link>
      </div>
    </article>
  );
}
