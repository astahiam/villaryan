import Link from "next/link";

const links = [
  { href: "/search?q=Ubud&lat=-8.507&lng=115.262&intent=RENT", label: "Explore" },
  { href: "/list-property", label: "List a property" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="font-serif text-2xl tracking-tight text-forest-800">
          Villaryan
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm text-ink-700 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-forest-800">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/list-property"
          className="rounded-full bg-forest-800 px-4 py-2 text-sm text-sand-50 hover:bg-forest-900"
        >
          List your property
        </Link>
      </div>
    </header>
  );
}
