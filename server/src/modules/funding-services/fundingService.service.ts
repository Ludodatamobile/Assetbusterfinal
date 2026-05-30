import slugify from "slugify";
import { v4 as uuid } from "uuid";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type {
  CreateFundingServiceInput,
  UpdateFundingServiceInput,
} from "./fundingService.schema.js";

const makeSlug = (title: string) => {
  const base = slugify(title, { lower: true, strict: true }) || "funding-service";
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

export class FundingServiceService {
  static async list(query: any) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);

    const where: any = {
      profileType: "FUNDING_SERVICE",
      status: "ACTIVE",
    };

    if (query.industry) where.industry = { contains: query.industry, mode: "insensitive" };
    if (query.country) where.country = { contains: query.country, mode: "insensitive" };
    if (query.currency) where.currency = String(query.currency).toUpperCase();
    if (query.fundingServiceType) where.fundingServiceType = { contains: query.fundingServiceType, mode: "insensitive" };
    if (query.capitalProviderType) where.capitalProviderType = { contains: query.capitalProviderType, mode: "insensitive" };
    if (query.capitalType) where.capitalTypes = { has: query.capitalType };

    if (query.minTicket || query.maxTicket) {
      where.AND = [];
      if (query.minTicket) {
        where.AND.push({
          OR: [{ ticketMax: { gte: Number(query.minTicket) } }, { ticketMax: null }],
        });
      }
      if (query.maxTicket) {
        where.AND.push({
          OR: [{ ticketMin: { lte: Number(query.maxTicket) } }, { ticketMin: null }],
        });
      }
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { industry: { contains: query.search, mode: "insensitive" } },
        { country: { contains: query.search, mode: "insensitive" } },
        { city: { contains: query.search, mode: "insensitive" } },
        { businessName: { contains: query.search, mode: "insensitive" } },
        { fundingServiceType: { contains: query.search, mode: "insensitive" } },
        { capitalProviderType: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any =
      query.sortBy === "oldest"
        ? { createdAt: "asc" }
        : query.sortBy === "ticketSize"
          ? { ticketMax: "desc" }
          : query.sortBy === "newest"
            ? { createdAt: "desc" }
            : [{ isFeatured: "desc" }, { isPremium: "desc" }, { updatedAt: "desc" }];

    const [fundingServices, total] = await prisma.$transaction([
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
      data: fundingServices,
      meta: buildMeta(total, page, limit),
    };
  }

  static async getBySlug(slug: string) {
    const fundingService = await prisma.businessProfile.findUnique({
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
      !fundingService ||
      fundingService.profileType !== "FUNDING_SERVICE" ||
      fundingService.status !== "ACTIVE"
    ) {
      throw ApiError.notFound("Funding service not found.");
    }

    prisma.businessProfile
      .update({
        where: { id: fundingService.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => undefined);

    return fundingService;
  }

  static async create(userId: string, data: CreateFundingServiceInput) {
    const fundingService = await prisma.businessProfile.create({
      data: {
        userId,
        slug: makeSlug(data.title),
        profileType: "FUNDING_SERVICE",
        title: data.title,
        description: data.description,
        industry: data.industry,
        country: data.country,
        city: data.city,
        dealType: data.dealType || "BUSINESS_LOAN",
        currency: data.currency || "USD",
        askAmount: data.askAmount || data.ticketMax || data.ticketMin || 0,

        businessName: data.businessName,
        website: data.website,
        headline: data.headline,
        shortSummary: data.shortSummary,

        fundingServiceType: data.fundingServiceType,
        capitalProviderType: data.capitalProviderType,
        capitalTypes: data.capitalTypes || [],
        ticketMin: data.ticketMin,
        ticketMax: data.ticketMax,
        targetCompanyStage: data.targetCompanyStage,
        collateralRequired: data.collateralRequired || false,
        repaymentTerms: data.repaymentTerms,
        processingTime: data.processingTime,
        regionsCovered: data.regionsCovered || [],
        eligibilityCriteria: data.eligibilityCriteria,
        requiredDocuments: data.requiredDocuments,
        feesDescription: data.feesDescription,
        regulatoryLicense: data.regulatoryLicense,
        fundingServiceHighlights: data.fundingServiceHighlights,

        isConfidential: data.isConfidential ?? false,
        ndaRequired: data.ndaRequired ?? false,
        status: "DRAFT",
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Funding service created",
        body: `${fundingService.title} has been saved as a draft.`,
        type: "FundingService",
        link: "/funding-service",
      },
    });

    return fundingService;
  }

  static async update(
    userId: string,
    fundingServiceId: string,
    data: UpdateFundingServiceInput
  ) {
    const fundingService = await prisma.businessProfile.findUnique({
      where: { id: fundingServiceId },
    });

    if (!fundingService) throw ApiError.notFound("Funding service not found.");
    if (fundingService.profileType !== "FUNDING_SERVICE") {
      throw ApiError.badRequest("This listing is not a funding service.");
    }
    if (fundingService.userId !== userId) {
      throw ApiError.forbidden("You do not own this funding service.");
    }
    if (fundingService.status === "CLOSED") {
      throw ApiError.badRequest("Cannot update a closed funding service.");
    }

    return prisma.businessProfile.update({
      where: { id: fundingServiceId },
      data,
    });
  }

  static async submit(userId: string, fundingServiceId: string) {
    const fundingService = await prisma.businessProfile.findUnique({
      where: { id: fundingServiceId },
    });

    if (!fundingService) throw ApiError.notFound("Funding service not found.");
    if (fundingService.profileType !== "FUNDING_SERVICE") {
      throw ApiError.badRequest("This listing is not a funding service.");
    }
    if (fundingService.userId !== userId) {
      throw ApiError.forbidden("You do not own this funding service.");
    }
    if (!["DRAFT", "REJECTED"].includes(fundingService.status)) {
      throw ApiError.badRequest(
        "Only draft or rejected funding services can be submitted for review."
      );
    }

    return prisma.businessProfile.update({
      where: { id: fundingServiceId },
      data: { status: "PENDING_REVIEW" },
    });
  }

  static async delete(userId: string, fundingServiceId: string) {
    const fundingService = await prisma.businessProfile.findUnique({
      where: { id: fundingServiceId },
    });

    if (!fundingService) throw ApiError.notFound("Funding service not found.");
    if (fundingService.profileType !== "FUNDING_SERVICE") {
      throw ApiError.badRequest("This listing is not a funding service.");
    }
    if (fundingService.userId !== userId) {
      throw ApiError.forbidden("You do not own this funding service.");
    }
    if (!["DRAFT", "REJECTED"].includes(fundingService.status)) {
      throw ApiError.badRequest(
        "Only draft or rejected funding services can be deleted."
      );
    }

    await prisma.businessProfile.delete({
      where: { id: fundingServiceId },
    });

    return { id: fundingServiceId };
  }

  static async enquire(userId: string, fundingServiceId: string, message: string) {
    const fundingService = await prisma.businessProfile.findUnique({
      where: { id: fundingServiceId },
    });

    if (
      !fundingService ||
      fundingService.profileType !== "FUNDING_SERVICE" ||
      fundingService.status !== "ACTIVE"
    ) {
      throw ApiError.notFound("Funding service not found.");
    }

    if (fundingService.userId === userId) {
      throw ApiError.badRequest("You cannot enquire on your own funding service.");
    }

    const deal = await prisma.$transaction(async (tx) => {
      const createdDeal = await tx.deal.create({
        data: {
          businessId: fundingService.id,
          initiatorId: userId,
          receiverId: fundingService.userId,
          status: "INQUIRY",
          messages: {
            create: {
              senderId: userId,
              content: message,
            },
          },
        },
        include: {
          business: true,
          initiator: true,
          receiver: true,
          _count: {
            select: {
              messages: true,
              documents: true,
            },
          },
        },
      });

      await tx.businessProfile.update({
        where: { id: fundingService.id },
        data: { enquiryCount: { increment: 1 } },
      });

      await tx.notification.create({
        data: {
          userId: fundingService.userId,
          title: "New funding service enquiry",
          body: "A member requested funding support from your funding service listing.",
          type: "FundingService",
          link: "/dashboard?tab=enquiries",
          meta: {
            dealId: createdDeal.id,
            fundingServiceId: fundingService.id,
          },
        },
      });

      return createdDeal;
    });

    return deal;
  }
}