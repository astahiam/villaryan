import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-sand-200 bg-sand-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl text-forest-800">Villaryan</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-ink-700">
            A location-first marketplace for villas, stays, homes, land, and boarding houses.
            360° Location Awareness means discovering what surrounds a place — not 360° photography.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-ink-900">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            <li><Link href="/search?q=Ubud&lat=-8.507&lng=115.262&intent=RENT">Search rentals</Link></li>
            <li><Link href="/search?q=Ubud&lat=-8.507&lng=115.262&intent=SALE">Search for sale</Link></li>
            <li><Link href="/list-property">List a property</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-ink-900">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/listing-disclaimer">Listing disclaimer</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-sand-200 px-4 py-4 text-center text-xs text-ink-700">
        © {new Date().getFullYear()} Villaryan.id · Listings are not independently verified unless stated.
      </p>
    </footer>
  );
}
