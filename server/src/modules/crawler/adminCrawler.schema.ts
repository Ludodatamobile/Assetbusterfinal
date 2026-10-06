import { z } from "zod";

export const createCrawlSourceSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    baseUrl: z.string().url(),
    rateLimitMs: z.coerce.number().int().min(500).max(60_000).default(1500),
  }),
});

export const updateCrawlSourceSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid crawl source ID."),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    baseUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
    rateLimitMs: z.coerce.number().int().min(500).max(60_000).optional(),
  }),
});

export const updateImportedListingStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid imported listing ID."),
  }),
  body: z.object({
    status: z.enum(["PUBLISHED", "REJECTED", "ARCHIVED"]),
    isFeatured: z.boolean().optional(),
    rejectionReason: z.string().trim().max(500).optional(),
  }),
});