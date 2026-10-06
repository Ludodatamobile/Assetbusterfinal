import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export type CrawledListingInput = {
  externalId: string;
  sourceUrl: string;
  title: string;
  description?: string;
  industry?: string;
  country?: string;
  city?: string;
  currency?: string;
  askingPrice?: number;
  imageUrl?: string;
  contactUrl?: string;
  rawPayload?: Record<string, unknown>;
};

const normalizeText = (value?: string) =>
  value?.replace(/\s+/g, " ").trim() || undefined;

const toJson = (
  value?: Record<string, unknown>,
): Prisma.InputJsonValue | undefined =>
  value as Prisma.InputJsonValue | undefined;

const contentHash = (listing: CrawledListingInput) =>
  crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        title: normalizeText(listing.title)?.toLowerCase(),
        description: normalizeText(listing.description)?.toLowerCase(),
        industry: normalizeText(listing.industry)?.toLowerCase(),
        country: normalizeText(listing.country)?.toLowerCase(),
        city: normalizeText(listing.city)?.toLowerCase(),
        askingPrice: listing.askingPrice,
      }),
    )
    .digest("hex");

export async function importCrawledListing(
  sourceId: string,
  listing: CrawledListingInput,
) {
  const hash = contentHash(listing);

  const existing = await prisma.importedListing.findUnique({
    where: {
      sourceId_externalId: {
        sourceId,
        externalId: listing.externalId,
      },
    },
    select: {
      id: true,
      contentHash: true,
      status: true,
    },
  });

  if (existing?.contentHash === hash) {
    await prisma.importedListing.update({
      where: { id: existing.id },
      data: { lastSeenAt: new Date() },
    });

    return { action: "unchanged" as const, id: existing.id };
  }

  const data = {
    externalId: listing.externalId,
    sourceUrl: listing.sourceUrl,
    contentHash: hash,
    title: normalizeText(listing.title) ?? "Untitled listing",
    description: normalizeText(listing.description),
    industry: normalizeText(listing.industry),
    country: normalizeText(listing.country),
    city: normalizeText(listing.city),
    currency: listing.currency?.toUpperCase() || "USD",
    askingPrice: listing.askingPrice,
    imageUrl: listing.imageUrl,
    contactUrl: listing.contactUrl,
    rawPayload: toJson(listing.rawPayload),
    lastSeenAt: new Date(),

    // Any content change goes back for admin review.
    status: existing ? "PENDING_REVIEW" as const : "PENDING_REVIEW" as const,
    publishedAt: null,
    rejectionReason: null,
  };

  if (existing) {
    const updated = await prisma.importedListing.update({
      where: { id: existing.id },
      data,
    });

    return { action: "updated" as const, id: updated.id };
  }

  const created = await prisma.importedListing.create({
    data: {
      ...data,
      sourceId,
    },
  });

  return { action: "created" as const, id: created.id };
}