"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  title: string;
  status: string;
  category: string;
  intent: string;
  locationLabel: string;
  createdAt: string;
};

export function ModerationTable({ listings }: { listings: Row[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    setError(null);
    const response = await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        rejectionReason: status === "REJECTED" ? "Does not meet listing standards" : undefined,
      }),
    });
    if (!response.ok) {
      setError("Update failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-8 overflow-x-auto rounded-2xl border border-sand-200 bg-white">
      {error ? <p className="p-4 text-sm text-red-800">{error}</p> : null}
      <table className="min-w-full text-left text-sm">
        <thead className="bg-sand-100">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Area</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((row) => (
            <tr key={row.id} className="border-t border-sand-200">
              <td className="px-4 py-3">{row.title}</td>
              <td className="px-4 py-3">{row.status}</td>
              <td className="px-4 py-3">
                {row.category} / {row.intent}
              </td>
              <td className="px-4 py-3">{row.locationLabel}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => decide(row.id, "APPROVED")}
                    className="rounded-full bg-forest-800 px-3 py-1 text-white"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(row.id, "REJECTED")}
                    className="rounded-full border border-sand-300 px-3 py-1"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
