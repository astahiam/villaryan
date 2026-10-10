export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl">Contact</h1>
      <p className="mt-4 text-sm leading-7 text-ink-800">
        For product questions, listing issues, or partnership notes, write to{" "}
        <a className="underline" href="mailto:hello@villaryan.id">
          hello@villaryan.id
        </a>
        . Do not send payment details.
      </p>
    </div>
  );
}
