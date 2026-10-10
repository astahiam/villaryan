const ALLOWED_HOST_SUFFIXES = [
  "airbnb.com",
  "airbnb.co.id",
  "booking.com",
  "expedia.com",
  "agoda.com",
  "hotels.com",
  "tripadvisor.com",
  "kayak.com",
  "priceline.com",
  "stayapi.com",
];

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function sanitizeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!isSafeHttpUrl(value)) return null;
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  return url.toString();
}

export function isAllowedBookingHost(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return ALLOWED_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
}

export function whatsappLink(raw: string, message?: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function telLink(raw: string): string | null {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.replace(/\D/g, "").length < 8) return null;
  return `tel:${cleaned}`;
}

export function mailtoLink(email: string, subject?: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${email}${query}`;
}
