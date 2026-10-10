export const metadata = { title: "Listing disclaimer" };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl">Listing disclaimer</h1>
      <p className="mt-4 text-sm leading-7 text-ink-800">
        Local listings are owner-submitted and appear only after editorial moderation. Moderation is not a legal,
        title, or safety inspection. StayAPI and other provider results are third-party inventory. Fixture records
        are labeled and must not be treated as live or verified listings. Nearby points of interest come from
        community map data and are not exhaustive.
      </p>
    </div>
  );
}
