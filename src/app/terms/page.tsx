export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl">Terms of use</h1>
      <p className="mt-4 text-sm leading-7 text-ink-800">
        Villaryan is a discovery service. It does not complete payments or reservations. External bookings are
        contracts between you and the provider. Owner listings may be incomplete or outdated. Always verify title,
        availability, and identity independently.
      </p>
    </div>
  );
}
