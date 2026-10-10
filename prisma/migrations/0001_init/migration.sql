-- CreateExtension
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "PropertyCategory" AS ENUM ('VILLA', 'HOTEL', 'HOUSE', 'APARTMENT', 'LAND', 'BOARDING_HOUSE');

-- CreateEnum
CREATE TYPE "TransactionIntent" AS ENUM ('RENT', 'SALE');

-- CreateEnum
CREATE TYPE "PricePeriod" AS ENUM ('NIGHT', 'MONTH', 'YEAR', 'TOTAL');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PropertySourceKind" AS ENUM ('LOCAL', 'STAYAPI_BOOKING', 'STAYAPI_AIRBNB', 'MOCK');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('WHATSAPP', 'PHONE', 'EMAIL');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'MODERATOR');

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "PropertyCategory" NOT NULL,
    "intent" "TransactionIntent" NOT NULL,
    "description" TEXT NOT NULL,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priceAmount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "pricePeriod" "PricePeriod",
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "locationLabel" TEXT NOT NULL,
    "approximateAddress" TEXT NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Indonesia',
    "source" "PropertySourceKind" NOT NULL DEFAULT 'LOCAL',
    "sourceRef" TEXT,
    "externalUrl" TEXT,
    "isFixture" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "attribution" TEXT,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingContact" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "preferredMethod" "ContactMethod" NOT NULL,
    "whatsapp" TEXT,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "ListingContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "propertyId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
CREATE INDEX "Property_status_intent_category_idx" ON "Property"("status", "intent", "category");
CREATE INDEX "Property_source_sourceRef_idx" ON "Property"("source", "sourceRef");
CREATE UNIQUE INDEX "ListingContact_propertyId_key" ON "ListingContact"("propertyId");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingContact" ADD CONSTRAINT "ListingContact_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Property"
  ADD COLUMN "geom" geography(Point, 4326)
  GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint("longitude"::double precision, "latitude"::double precision), 4326)::geography
  ) STORED;

CREATE INDEX "Property_geom_gix" ON "Property" USING GIST ("geom");
