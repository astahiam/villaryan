import { Suspense } from "react";
import { SearchExperience } from "@/components/search/SearchExperience";

export const metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading search…</p>}>
      <SearchExperience />
    </Suspense>
  );
}
