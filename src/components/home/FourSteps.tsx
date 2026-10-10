const steps = [
  { n: "01", title: "Where?", body: "Choose a place, search an address, or share your location after you grant permission." },
  { n: "02", title: "Rent or sale", body: "Tell us whether you want a stay, a longer rental, or a property to buy." },
  { n: "03", title: "Pick one", body: "Move between the map and the list. Cards and markers stay in sync." },
  { n: "04", title: "Proceed to host", body: "Message the owner, or continue to an external booking provider when the listing is not local." },
];

export function FourSteps() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="text-sm uppercase tracking-[0.18em] text-forest-800">How it works</p>
      <h2 className="mt-2 font-serif text-4xl text-ink-900">Four steps to a place that fits.</h2>
      <ol className="mt-10 grid gap-6 md:grid-cols-4">
        {steps.map((step) => (
          <li key={step.n} className="rounded-2xl border border-sand-200 bg-white p-6">
            <p className="text-sm text-forest-800">{step.n}</p>
            <h3 className="mt-3 font-serif text-2xl">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-ink-700">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
