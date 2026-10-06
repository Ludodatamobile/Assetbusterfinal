-- CreateEnum
CREATE TYPE "CrawlRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "ImportedListingStatus" AS ENUM ('PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "CrawlSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rateLimitMs" INTEGER NOT NULL DEFAULT 1500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrawlSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlRun" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" "CrawlRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "discovered" INTEGER NOT NULL DEFAULT 0,
    "created" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "rejected" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "CrawlRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportedListing" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "status" "ImportedListingStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "country" TEXT,
    "city" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "askingPrice" DECIMAL(18,2),
    "imageUrl" TEXT,
    "contactUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawPayload" JSONB,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportedListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrawlSource_baseUrl_key" ON "CrawlSource"("baseUrl");

-- CreateIndex
CREATE INDEX "CrawlRun_sourceId_startedAt_idx" ON "CrawlRun"("sourceId", "startedAt");

-- CreateIndex
CREATE INDEX "CrawlRun_status_idx" ON "CrawlRun"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ImportedListing_sourceUrl_key" ON "ImportedListing"("sourceUrl");

-- CreateIndex
CREATE INDEX "ImportedListing_status_publishedAt_idx" ON "ImportedListing"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "ImportedListing_industry_idx" ON "ImportedListing"("industry");

-- CreateIndex
CREATE INDEX "ImportedListing_country_idx" ON "ImportedListing"("country");

-- CreateIndex
CREATE INDEX "ImportedListing_lastSeenAt_idx" ON "ImportedListing"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImportedListing_sourceId_externalId_key" ON "ImportedListing"("sourceId", "externalId");

-- AddForeignKey
ALTER TABLE "CrawlRun" ADD CONSTRAINT "CrawlRun_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "CrawlSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedListing" ADD CONSTRAINT "ImportedListing_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "CrawlSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
