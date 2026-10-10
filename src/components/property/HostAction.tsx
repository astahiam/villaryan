"use client";

import { mailtoLink, telLink, whatsappLink } from "@/lib/links";
import type { NormalizedProperty } from "@/lib/types";

export function HostAction({ property }: { property: NormalizedProperty }) {
  async function track(type: string) {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, propertyId: property.id, source: property.source }),
    });
  }

  if (property.externalUrl) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-5">
        <p className="font-medium">Continue with the listing source</p>
        <p className="mt-2 text-sm text-ink-700">
          Booking, dates, guests, and payment are handled by the external provider. Villaryan does not complete
          reservations.
        </p>
        <a
          href={property.externalUrl}
          rel="noopener noreferrer"
          target="_blank"
          onClick={() => track("outbound_click")}
          className="mt-4 inline-flex rounded-full bg-forest-800 px-5 py-2.5 text-sm text-white"
        >
          Continue to provider
        </a>
      </div>
    );
  }

  const contact = property.contact;
  if (!contact) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-5">
        <p className="text-sm text-ink-700">No public host contact is configured for this listing.</p>
      </div>
    );
  }

  const message = `Hello, I found ${property.title} on Villaryan and would like to enquire.`;
  const href =
    contact.preferredMethod === "WHATSAPP" && contact.whatsapp
      ? whatsappLink(contact.whatsapp, message)
      : contact.preferredMethod === "PHONE" && contact.phone
        ? telLink(contact.phone)
        : contact.email
          ? mailtoLink(contact.email, `Enquiry: ${property.title}`)
          : null;

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-5">
      <p className="font-medium">Proceed to host</p>
      <p className="mt-2 text-sm text-ink-700">
        Contact {contact.displayName} by {contact.preferredMethod.toLowerCase()}. This is not a completed booking.
      </p>
      {href ? (
        <a
          href={href}
          onClick={() => track("inquiry_click")}
          className="mt-4 inline-flex rounded-full bg-forest-800 px-5 py-2.5 text-sm text-white"
        >
          Contact host
        </a>
      ) : (
        <p className="mt-3 text-sm">The configured contact method is invalid.</p>
      )}
    </div>
  );
}
