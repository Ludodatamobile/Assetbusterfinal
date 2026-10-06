import { prisma } from "../../config/prisma.js";

type CatalogQuery = {
  page?: string;
  limit?: string;
  industry?: string;
  country?: string;
  search?: string;
};

export async function getImportedCatalog(query: CatalogQuery) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 50);
  const skip = (page - 1) * limit;

  const search = query.search?.trim();

  const where = {
    status: "PUBLISHED" as const,
    ...(query.industry ? { industry: query.industry } : {}),
    ...(query.country ? { country: query.country } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { industry: { contains: search, mode: "insensitive" as const } },
            { country: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.importedListing.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { isFeatured: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        industry: true,
        country: true,
        city: true,
        currency: true,
        askingPrice: true,
        imageUrl: true,
        sourceUrl: true,
        isFeatured: true,
        publishedAt: true,
        source: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.importedListing.count({ where }),
  ]);

  return {
    data: items.map((item) => ({
      ...item,
      askingPrice: item.askingPrice?.toString() ?? null,
      sourceName: item.source.name,
      source: undefined,
      listingType: "IMPORTED",
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