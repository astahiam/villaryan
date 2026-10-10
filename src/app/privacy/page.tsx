export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-7 text-ink-800">
        Villaryan collects listing submissions, basic enquiry click events, and optional location used for search.
        Browser geolocation is requested only with permission. Precise user coordinates are rounded before they are
        stored in search URLs. Admin authentication uses an HTTP-only session cookie.
      </p>
      <p className="mt-4 text-sm leading-7 text-ink-800">
        External inventory providers receive the destination and optional stay dates needed to query their APIs.
        Provider API keys stay on the server.
      </p>
    </div>
  );
}
