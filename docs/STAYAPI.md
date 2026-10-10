# StayAPI evaluation (October 2026)

Official documentation reviewed: [stayapi.com/docs](https://stayapi.com/docs)

Authentication: `x-api-key` header. Keys stay on the server (`STAYAPI_API_KEY`).

## Capabilities used in this MVP

| Capability | Endpoint | Used | Notes |
| --- | --- | --- | --- |
| Destination lookup | `GET /v1/booking/destinations/lookup` | Yes | Converts a place name to Booking.com `dest_id`. |
| Hotel / short-stay search | `GET /v1/booking/search` | Yes | Requires `dest_id`. Optional `checkin` / `checkout`. Returns live quotes when dates are present. Prices are not a completed booking. |
| Airbnb destination search | `GET /v1/airbnb/search` | Yes | First page only. `availability_verified` is always `false`. Coordinates are often missing. |
| Airbnb listing details | `GET /v1/airbnb/listing/{id}/details` | Yes, on detail pages when dates exist | **Requires** check-in and check-out. Does not include the full description (overview is a separate endpoint). |
| Meta search / booking links | `GET /v1/meta/search` | Yes, for hotel handoff | Returns booking URLs across platforms. |

## Not implemented in the MVP

- Airbnb photos, overview, calendar, pricing, cancellation, and payment-method endpoints (extra calls, extra cost, dates required).
- Date-specific hotel pricing as a first-class UI (the homepage search is location-first; optional `checkIn` / `checkOut` query params are forwarded when present).
- Treating Airbnb destination cards as confirmed availability.
- Land, boarding houses, or sale inventory from StayAPI (the API is hospitality search).

## Fallback

If `STAYAPI_API_KEY` is empty, the mock adapter returns clearly labeled development fixtures. The site remains usable with local owner listings.
