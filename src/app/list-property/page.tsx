import { ListingForm } from "@/components/listing/ListingForm";

export const metadata = { title: "List your property" };

export default function ListPropertyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm uppercase tracking-[0.18em] text-forest-800">Owners</p>
      <h1 className="mt-2 font-serif text-4xl">List your property</h1>
      <p className="mt-3 text-sm leading-6 text-ink-700">
        Submissions enter pending moderation and are not public until approved. Providing a listing does not mean
        the owner or property is verified.
      </p>
      <div className="mt-8">
        <ListingForm />
      </div>
    </div>
  );
}
