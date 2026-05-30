import slugify from "slugify";
import { v4 as uuid } from "uuid";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type {
  CreateStartupInput,
  UpdateStartupInput,
} from "./startup.schema.js";

const makeSlug = (title: string) => {
  const base = slugify(title, { lower: true, strict: true }) || "startup";
  return `${base}-${uuid().slice(0, 6)}`;
};

const getPagination = (pageValue?: unknown, limitValue?: unknown) => {
  const page = Math.max(Number(pageValue || 1), 1);
  const limit = Math.min(Math.max(Number(limitValue || 12), 1), 50);
  const skip = (page - 1) * limit;

  return { page, limit, skip, take: limit };
};

const buildMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const publicInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      country: true,
      profileImage: true,
      verified: true,
      role: true,
    },
  },
  _count: {
    select: {
      deals: true,
      documents: true,
      savedBy: true,
    },
  },
};

const detailInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      country: true,
      profileImage: true,
      verified: true,
      role: true,
    },
  },
  documents: {
    where: {
      access: "PUBLIC_TEASER",
      status: "VERIFIED",
    },
    orderBy: { createdAt: "desc" as const },
  },
  _count: {
    select: {
      deals: true,
      documents: true,
      savedBy: true,
    },
  },
};

export class StartupService {
  static async list(query: any) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);

    const where: any = {
      profileType: "STARTUP",
      status: "ACTIVE",
    };

    if (query.category) {
      where.startupCategory = query.category;
    }

    if (query.startupStage) {
      where.startupStage = query.startupStage;
    }

    if (query.country) {
      where.country = query.country;
    }

    if (query.currency) {
      where.currency = String(query.currency).toUpperCase();
    }

    if (query.minFunding || query.maxFunding) {
      where.fundingNeeded = {};
      if (query.minFunding) where.fundingNeeded.gte = Number(query.minFunding);
      if (query.maxFunding) where.fundingNeeded.lte = Number(query.maxFunding);
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { industry: { contains: query.search, mode: "insensitive" } },
        { country: { contains: query.search, mode: "insensitive" } },
        { city: { contains: query.search, mode: "insensitive" } },
        { startupType: { contains: query.search, mode: "insensitive" } },
        { startupCategory: { contains: query.search, mode: "insensitive" } },
        { problemStatement: { contains: query.search, mode: "insensitive" } },
        { solutionStatement: { contains: query.search, mode: "insensitive" } },
        { targetMarket: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any =
      query.sortBy === "oldest"
        ? { createdAt: "asc" }
        : query.sortBy === "fundingNeeded"
          ? { fundingNeeded: "desc" }
          : query.sortBy === "newest"
            ? { createdAt: "desc" }
            : [
                { isFeatured: "desc" },
                { isPremium: "desc" },
                { updatedAt: "desc" },
              ];

    const [startups, total] = await prisma.$transaction([
      prisma.businessProfile.findMany({
        where,
        skip,
        take,
        orderBy,
        include: publicInclude,
      }),
      prisma.businessProfile.count({ where }),
    ]);

    return {
      data: startups,
      meta: buildMeta(total, page, limit),
    };
  }

  static async getBySlug(slug: string) {
    const startup = await prisma.businessProfile.findUnique({
      where: { slug },
      include: detailInclude,
    });

    if (
      !startup ||
      startup.profileType !== "STARTUP" ||
      startup.status !== "ACTIVE"
    ) {
      throw ApiError.notFound("Startup not found.");
    }

    prisma.businessProfile
      .update({
        where: { id: startup.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => undefined);

    return startup;
  }

  static async create(userId: string, data: CreateStartupInput) {
    const askAmount = Number(data.askAmount || data.fundingNeeded || 0);
    const industry = data.industry || data.startupCategory;

    const startup = await prisma.businessProfile.create({
      data: {
        userId,
        slug: makeSlug(data.title),
        profileType: "STARTUP",
        title: data.title,
        description: data.description,
        industry,
        country: data.country,
        city: data.city,

        businessName: data.businessName,
        website: data.website,
        headline: data.headline,
        shortSummary: data.shortSummary,

        dealType: data.dealType || "INVESTMENT",
        currency: data.currency || "USD",
        askAmount,

        startupType: data.startupType,
        startupCategory: data.startupCategory,
        startupStage: data.startupStage,
        problemStatement: data.problemStatement,
        solutionStatement: data.solutionStatement,
        targetMarket: data.targetMarket,
        marketSize: data.marketSize,
        businessModel: data.businessModel,
        revenueModel: data.revenueModel,
        productStatus: data.productStatus,
        tractionSummary: data.tractionSummary,
        teamSummary: data.teamSummary,
        technologyStack: data.technologyStack,
        goToMarketStrategy: data.goToMarketStrategy,
        competitors: data.competitors,
        startupHighlights: data.startupHighlights,
        fundingNeeded: data.fundingNeeded,
        imageUrls: data.imageUrls || [],

        isConfidential: data.isConfidential ?? false,
        ndaRequired: data.ndaRequired ?? false,
        status: "DRAFT",
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Startup created",
        body: `${startup.title} has been saved as a draft.`,
        type: "Startup",
        link: "/dashboard?tab=startups",
      },
    });

    return startup;
  }

  static async update(
    userId: string,
    startupId: string,
    data: UpdateStartupInput,
  ) {
    const startup = await prisma.businessProfile.findUnique({
      where: { id: startupId },
    });

    if (!startup) throw ApiError.notFound("Startup not found.");

    if (startup.profileType !== "STARTUP") {
      throw ApiError.badRequest("This listing is not a startup.");
    }

    if (startup.userId !== userId) {
      throw ApiError.forbidden("You do not own this startup.");
    }

    if (startup.status === "CLOSED") {
      throw ApiError.badRequest("Cannot update a closed startup.");
    }

    const updateData: any = { ...data };

    if (data.startupCategory && !data.industry) {
      updateData.industry = data.startupCategory;
    }

    if (data.fundingNeeded !== undefined && data.askAmount === undefined) {
      updateData.askAmount = data.fundingNeeded || 0;
    }

    return prisma.businessProfile.update({
      where: { id: startupId },
      data: updateData,
    });
  }

  static async submit(userId: string, startupId: string) {
    const startup = await prisma.businessProfile.findUnique({
      where: { id: startupId },
    });

    if (!startup) throw ApiError.notFound("Startup not found.");

    if (startup.profileType !== "STARTUP") {
      throw ApiError.badRequest("This listing is not a startup.");
    }

    if (startup.userId !== userId) {
      throw ApiError.forbidden("You do not own this startup.");
    }

    if (!["DRAFT", "REJECTED"].includes(startup.status)) {
      throw ApiError.badRequest(
        "Only draft or rejected startups can be submitted for review.",
      );
    }

    return prisma.businessProfile.update({
      where: { id: startupId },
      data: { status: "PENDING_REVIEW" },
    });
  }

  static async delete(userId: string, startupId: string) {
    const startup = await prisma.businessProfile.findUnique({
      where: { id: startupId },
    });

    if (!startup) throw ApiError.notFound("Startup not found.");

    if (startup.profileType !== "STARTUP") {
      throw ApiError.badRequest("This listing is not a startup.");
    }

    if (startup.userId !== userId) {
      throw ApiError.forbidden("You do not own this startup.");
    }

    if (!["DRAFT", "REJECTED"].includes(startup.status)) {
      throw ApiError.badRequest(
        "Only draft or rejected startups can be deleted.",
      );
    }

    await prisma.businessProfile.delete({
      where: { id: startupId },
    });

    return { id: startupId };
  }
}