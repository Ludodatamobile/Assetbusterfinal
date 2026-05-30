import slugify from "slugify";
import { v4 as uuid } from "uuid";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type {
  CreateFundraiserInput,
  UpdateFundraiserInput,
} from "./fundraiser.schema.js";

const makeSlug = (title: string) => {
  const base = slugify(title, { lower: true, strict: true }) || "fundraiser";
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

export class FundraiserService {
  static async list(query: any) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);

    const where: any = {
      profileType: "RAISE_CAPITAL",
      status: "ACTIVE",
    };

    if (query.industry) {
      where.industry = { contains: query.industry, mode: "insensitive" };
    }

    if (query.country) {
      where.country = { contains: query.country, mode: "insensitive" };
    }

    if (query.currency) {
      where.currency = String(query.currency).toUpperCase();
    }

    if (query.minAsk || query.maxAsk) {
      where.askAmount = {};
      if (query.minAsk) where.askAmount.gte = Number(query.minAsk);
      if (query.maxAsk) where.askAmount.lte = Number(query.maxAsk);
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { industry: { contains: query.search, mode: "insensitive" } },
        { country: { contains: query.search, mode: "insensitive" } },
        { city: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any =
      query.sortBy === "oldest"
        ? { createdAt: "asc" }
        : query.sortBy === "askAmount"
          ? { askAmount: "desc" }
          : query.sortBy === "newest"
            ? { createdAt: "desc" }
            : [{ isFeatured: "desc" }, { isPremium: "desc" }, { updatedAt: "desc" }];

    const [fundraisers, total] = await prisma.$transaction([
      prisma.businessProfile.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
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
        },
      }),
      prisma.businessProfile.count({ where }),
    ]);

    return {
      data: fundraisers,
      meta: buildMeta(total, page, limit),
    };
  }

  static async getBySlug(slug: string) {
    const fundraiser = await prisma.businessProfile.findUnique({
      where: { slug },
      include: {
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
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            deals: true,
            documents: true,
            savedBy: true,
          },
        },
      },
    });

    if (
      !fundraiser ||
      fundraiser.profileType !== "RAISE_CAPITAL" ||
      fundraiser.status !== "ACTIVE"
    ) {
      throw ApiError.notFound("Fund raiser not found.");
    }

    prisma.businessProfile
      .update({
        where: { id: fundraiser.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => undefined);

    return fundraiser;
  }

  static async create(userId: string, data: CreateFundraiserInput) {
    const fundraiser = await prisma.businessProfile.create({
      data: {
        userId,
        slug: makeSlug(data.title),
        profileType: "RAISE_CAPITAL",
        title: data.title,
        description: data.description,
        industry: data.industry,
        country: data.country,
        city: data.city,
        dealType: data.dealType || "INVESTMENT",
        currency: data.currency || "USD",
        askAmount: data.askAmount,
        askPercent: data.askPercent,
        askRate: data.askRate,
        runSales: data.runSales,
        ebitda: data.ebitda,
        status: "DRAFT",
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Fund raiser created",
        body: `${fundraiser.title} has been saved as a draft.`,
        type: "Fundraiser",
        link: "/dashboard?tab=fundraisers",
      },
    });

    return fundraiser;
  }

  static async update(
    userId: string,
    fundraiserId: string,
    data: UpdateFundraiserInput
  ) {
    const fundraiser = await prisma.businessProfile.findUnique({
      where: { id: fundraiserId },
    });

    if (!fundraiser) throw ApiError.notFound("Fund raiser not found.");
    if (fundraiser.profileType !== "RAISE_CAPITAL") {
      throw ApiError.badRequest("This listing is not a fund raiser.");
    }
    if (fundraiser.userId !== userId) {
      throw ApiError.forbidden("You do not own this fund raiser.");
    }
    if (fundraiser.status === "CLOSED") {
      throw ApiError.badRequest("Cannot update a closed fund raiser.");
    }

    return prisma.businessProfile.update({
      where: { id: fundraiserId },
      data,
    });
  }

  static async submit(userId: string, fundraiserId: string) {
    const fundraiser = await prisma.businessProfile.findUnique({
      where: { id: fundraiserId },
    });

    if (!fundraiser) throw ApiError.notFound("Fund raiser not found.");
    if (fundraiser.profileType !== "RAISE_CAPITAL") {
      throw ApiError.badRequest("This listing is not a fund raiser.");
    }
    if (fundraiser.userId !== userId) {
      throw ApiError.forbidden("You do not own this fund raiser.");
    }
    if (!["DRAFT", "REJECTED"].includes(fundraiser.status)) {
      throw ApiError.badRequest(
        "Only draft or rejected fund raisers can be submitted for review."
      );
    }

    return prisma.businessProfile.update({
      where: { id: fundraiserId },
      data: { status: "PENDING_REVIEW" },
    });
  }

  static async delete(userId: string, fundraiserId: string) {
    const fundraiser = await prisma.businessProfile.findUnique({
      where: { id: fundraiserId },
    });

    if (!fundraiser) throw ApiError.notFound("Fund raiser not found.");
    if (fundraiser.profileType !== "RAISE_CAPITAL") {
      throw ApiError.badRequest("This listing is not a fund raiser.");
    }
    if (fundraiser.userId !== userId) {
      throw ApiError.forbidden("You do not own this fund raiser.");
    }
    if (!["DRAFT", "REJECTED"].includes(fundraiser.status)) {
      throw ApiError.badRequest(
        "Only draft or rejected fund raisers can be deleted."
      );
    }

    await prisma.businessProfile.delete({
      where: { id: fundraiserId },
    });

    return { id: fundraiserId };
  }
}