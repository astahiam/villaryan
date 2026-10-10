# Villaryan.id

Location-first property discovery for villas, hotels and short stays, houses, apartments, land, and boarding houses.

The product follows four steps: **Where?** → **Rent or sale** → **Pick one** → **Proceed to host**.

360° Location Awareness means surrounding-area context (map, straight-line distance, selected nearby places). It is not 360° photography.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- PostgreSQL + PostGIS
- Prisma
- Zod
- MapLibre (OSM/Carto tiles in the browser). Optional Mapbox geocoding when `MAP_PROVIDER_API_KEY` is set
- StayAPI behind a server-side adapter, with a labeled mock fallback
- Local disk uploads, or S3-compatible object storage

## Quick start

```bash
cp .env.example .env
docker compose up -d db
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (defaults in `.env.example`).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm test` | Unit tests |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npx prisma migrate deploy` | Apply migrations |
| `npm run db:seed` | Seed admin user and sample listings |

## Environment variables

See `.env.example`. Never commit real secrets.

Required:

- `DATABASE_URL`
- `SESSION_SECRET` (32+ characters)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Optional:

- `STAYAPI_API_KEY` — empty uses the mock StayAPI adapter
- `MAP_PROVIDER_API_KEY` — empty uses the in-app gazetteer plus Nominatim
- `OBJECT_STORAGE_*` — empty stores photos under `public/uploads`

## Map choice

Mapbox and Google Maps both add usage-based cost and a public or session token. This MVP renders maps with **MapLibre + CARTO/OSM tiles** so the site works without a client map key. Geocoding stays on the server. If you add a Mapbox token, it is used only for server-side geocoding.

## Deployment (simplest)

1. Provision a PostgreSQL database with the PostGIS extension (Neon, RDS, or a VM).
2. Set the environment variables on the host (Vercel, Fly, or a Node VM).
3. Run `npx prisma migrate deploy` against that database.
4. Run `npm run db:seed` once.
5. Build and start: `npm run build && npm start`, or connect the repo to Vercel (`next build`).
6. Serve the app on HTTPS. `SESSION_SECRET` cookies are marked `Secure` in production.

If you use Vercel, attach a persistent disk or S3 for uploads. Local `public/uploads` does not survive serverless deploys.

## What still depends on third parties

- StayAPI live hotel and Airbnb inventory (mock fixtures otherwise)
- Nominatim / Overpass community data for geocoding and nearby places
- Object storage in production

## Known limitations

- In-memory rate limiting and StayAPI cache reset per server instance (no Redis)
- Airbnb destination search often lacks coordinates; markers are approximate
- No travel-time / road-distance engine
- No owner accounts, payments, or booking engine
- Seed Unsplash photos are attributed; do not scrape other sites
