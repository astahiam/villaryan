import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export function CategoryShortcuts() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h2 className="font-serif text-3xl">Browse by type</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((category) => (
          <Link
            key={category.value}
            href={`/search?q=Ubud&lat=-8.507&lng=115.262&intent=RENT&category=${category.value}`}
            className="rounded-2xl border border-sand-200 bg-white p-4 hover:border-forest-800"
          >
            <p className="font-medium text-ink-900">{category.label}</p>
            <p className="mt-1 text-xs text-ink-700">{category.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
