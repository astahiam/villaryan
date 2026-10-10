import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">This place is not listed.</h1>
      <p className="mt-3 text-sm text-ink-700">The property may be pending, removed, or the link is incorrect.</p>
      <Link href="/" className="mt-6 inline-flex text-forest-800 underline">
        Back home
      </Link>
    </div>
  );
}
