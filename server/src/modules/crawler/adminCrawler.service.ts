import { prisma } from "../../config/prisma.js";
import type { ImportedListingStatus } from "@prisma/client";

type ListQuery = {
  page?: string;
  limit?: string;
  status?: ImportedListingStatus;
  search?: string;
  sourceId?: string;
};

const getPagination = (query: ListQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

async function audit(
  adminId: string,
  action: string,
  entity: string,
  entityId: string,
  meta?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      entity,
      entityId,
      meta: meta ? JSON.parse(JSON.stringify(meta)) : undefined,
    },
  });
}

export class AdminCrawlerService {
  static async getOverview() {
    const [
      sources,
      pendingReview,
      published,
      rejected,
      recentRuns,
      recentListings,
    ] = await prisma.$transaction([
      prisma.crawlSource.count({ where: { isActive: true } }),
      prisma.importedListing.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.importedListing.count({ where: { status: "PUBLISHED" } }),
      prisma.importedListing.count({ where: { status: "REJECTED" } }),
      prisma.crawlRun.findMany({
        take: 10,
        orderBy: { startedAt: "desc" },
        include: {
          source: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.importedListing.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          source: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return {
      metrics: {
        activeSources: sources,
        pendingReview,
        published,
        rejected,
      },
      recentRuns,
      recentListings,
    };
  }

  static async getSources() {
    return prisma.crawlSource.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            listings: true,
            runs: true,
          },
        },
      },
    });
  }

  static async createSource(
    adminId: string,
    input: {
      name: string;
      baseUrl: string;
      rateLimitMs: number;
    },
  ) {
    const source = await prisma.crawlSource.create({
      data: input,
    });

    await audit(adminId, "CRAWL_SOURCE_CREATED", "CrawlSource", source.id, {
      name: source.name,
      baseUrl: source.baseUrl,
    });

    return source;
  }

  static async updateSource(
    adminId: string,
    sourceId: string,
    input: {
      name?: string;
      baseUrl?: string;
      isActive?: boolean;
      rateLimitMs?: number;
    },
  ) {
    const source = await prisma.crawlSource.update({
      where: { id: sourceId },
      data: input,
    });

    await audit(adminId, "CRAWL_SOURCE_UPDATED", "CrawlSource", source.id, input);

    return source;
  }

  static async getImportedListings(query: ListQuery) {
    const { page, limit, skip } = getPagination(query);
    const search = query.search?.trim();

    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.sourceId ? { sourceId: query.sourceId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { country: { contains: search, mode: "insensitive" as const } },
              { industry: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.importedListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          source: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.importedListing.count({ where }),
    ]);

    return {
      data: data.map((item) => ({
        ...item,
        askingPrice: item.askingPrice?.toString() ?? null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
      },
    };
  }

  static async updateImportedListingStatus(
    adminId: string,
    listingId: string,
    input: {
      status: "PUBLISHED" | "REJECTED" | "ARCHIVED";
      isFeatured?: boolean;
      rejectionReason?: string;
    },
  ) {
    if (input.status === "REJECTED" && !input.rejectionReason) {
      throw new Error("A rejection reason is required.");
    }

    const listing = await prisma.importedListing.update({
      where: { id: listingId },
      data: {
        status: input.status,
        isFeatured: input.isFeatured,
        rejectionReason:
          input.status === "REJECTED" ? input.rejectionReason : null,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
    });

    await audit(
      adminId,
      `IMPORTED_LISTING_${input.status}`,
      "ImportedListing",
      listing.id,
      input,
    );

    return listing;
  }
}