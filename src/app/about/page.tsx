export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl">About Villaryan</h1>
      <p className="mt-4 text-sm leading-7 text-ink-800">
        Villaryan.id is a location-first property discovery marketplace for temporary stays, longer rentals, and
        purchases. The product is built around a simple journey: where, rent or sale, pick one, and proceed to the host.
      </p>
      <p className="mt-4 text-sm leading-7 text-ink-800">
        360° Location Awareness is surrounding-area discovery — map context, straight-line distance, and selected
        nearby places. It is not a promise of 360-degree photography or verified travel times.
      </p>
    </div>
  );
}
