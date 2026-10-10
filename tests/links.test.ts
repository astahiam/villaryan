import { describe, expect, it } from "vitest";
import { isAllowedBookingHost, sanitizeExternalUrl, whatsappLink } from "@/lib/links";

describe("external links", () => {
  it("rejects javascript URLs", () => {
    expect(sanitizeExternalUrl("javascript:alert(1)")).toBeNull();
  });

  it("rejects protocol-relative tricks with credentials", () => {
    expect(sanitizeExternalUrl("https://user:pass@evil.com")).toBeNull();
  });

  it("allows https booking hosts", () => {
    expect(isAllowedBookingHost("https://www.booking.com/hotel/id/example.html")).toBe(true);
    expect(isAllowedBookingHost("https://evil.example")).toBe(false);
  });

  it("builds a whatsapp link from digits", () => {
    expect(whatsappLink("+62 811-1000-111")).toBe("https://wa.me/628111000111");
  });
});
