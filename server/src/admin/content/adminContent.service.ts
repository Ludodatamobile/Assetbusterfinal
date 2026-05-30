import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  getPaginationParams,
  buildPaginationMeta,
  createPaginationResult,
} from "../../utils/pagination.js";
import { AdminAuthService } from "../auth/adminAuth.service.js";
import { EmailService } from "../../services/email.service.js";

const CAMPAIGN_BATCH_SIZE = 50;

export class AdminContentService {

  static async getFeaturedListings() {
    return prisma.businessProfile.findMany({
      where: { isFeatured: true, status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        industry: true,
        country: true,
        askAmount: true,
        currency: true,
        rating: true,
        isFeatured: true,
        isPremium: true,
        isVerified: true,
        status: true,
        viewCount: true,
        enquiryCount: true,
        updatedAt: true,
        createdAt: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  static async getFeaturedInvestors() {
    return prisma.investorProfile.findMany({
      where: { isPremium: true },
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            country: true,
          },
        },
      },
    });
  }

  static async setListingFeatured(
    listingId: string,
    adminId: string,
    featured: boolean,
  ) {
    const listing = await prisma.businessProfile.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw ApiError.notFound("Listing not found");
    await prisma.businessProfile.update({
      where: { id: listingId },
      data: { isFeatured: featured },
    });
    await AdminAuthService.logActivity({
      adminId,
      action: featured ? "FEATURE_CONTENT" : "UNFEATURE_CONTENT",
      entity: "BusinessProfile",
      entityId: listingId,
      meta: { title: listing.title },
    });
  }

  static async setPremiumListing(
    listingId: string,
    adminId: string,
    isPremium: boolean,
  ) {
    const listing = await prisma.businessProfile.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw ApiError.notFound("Listing not found");
    await prisma.businessProfile.update({
      where: { id: listingId },
      data: { isPremium },
    });
    await AdminAuthService.logActivity({
      adminId,
      action: isPremium ? "SET_PREMIUM_CONTENT" : "REMOVE_PREMIUM_CONTENT",
      entity: "BusinessProfile",
      entityId: listingId,
      meta: { title: listing.title },
    });
  }

  static async setPremiumInvestor(
    investorId: string,
    adminId: string,
    isPremium: boolean,
  ) {
    const investor = await prisma.investorProfile.findUnique({
      where: { id: investorId },
      include: { user: { select: { email: true } } },
    });
    if (!investor) throw ApiError.notFound("Investor profile not found");
    await prisma.investorProfile.update({
      where: { id: investorId },
      data: { isPremium },
    });
    await AdminAuthService.logActivity({
      adminId,
      action: isPremium ? "SET_PREMIUM_INVESTOR" : "REMOVE_PREMIUM_INVESTOR",
      entity: "InvestorProfile",
      entityId: investorId,
      meta: { email: investor.user.email },
    });
  }

  static async getAuditLogs(query: {
    page?: string;
    limit?: string;
    adminId?: string;
    action?: string;
  }) {
    const { skip, take, page, limit } = getPaginationParams(
      query.page,
      query.limit,
    );

    const where: any = {};
    if (query.adminId) where.adminId = query.adminId;
    if (query.action)
      where.action = { contains: query.action, mode: "insensitive" };

    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, meta: buildPaginationMeta(total, page, limit) };
  }

  static async createCampaign(
    adminId: string,
    data: {
      title: string;
      subject: string;
      body: string;
      audience: string;
      scheduledAt?: string | null;
    },
  ) {
    if (!data.title?.trim())
      throw ApiError.badRequest("Campaign name is required");
    if (!data.subject?.trim())
      throw ApiError.badRequest("Email subject is required");
    if (!data.body?.trim())
      throw ApiError.badRequest("Message body is required");

    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    const sendNow = !scheduledAt || scheduledAt <= new Date();

    const campaign = await prisma.broadcastCampaign.create({
      data: {
        adminId,
        title: data.title.trim(),
        subject: data.subject.trim(),
        body: data.body.trim(),
        audience: data.audience ?? "ALL",
        status: sendNow ? "SENDING" : "SCHEDULED",
        scheduledAt: scheduledAt,
      },
    });

    await AdminAuthService.logActivity({
      adminId,
      action: sendNow ? "CREATE_AND_SEND_CAMPAIGN" : "SCHEDULE_CAMPAIGN",
      entity: "BroadcastCampaign",
      entityId: campaign.id,
      meta: {
        title: campaign.title,
        subject: campaign.subject,
        audience: campaign.audience,
      },
    });

    if (sendNow) {
      // Fire-and-forget — response returns immediately, sending continues in background
      this.executeCampaign(campaign.id).catch((err) => {
        console.error(`Campaign ${campaign.id} execution failed:`, err);
      });
    }

    return campaign;
  }

  static async executeCampaign(campaignId: string) {
    const campaign = await prisma.broadcastCampaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw ApiError.notFound("Campaign not found");
    if (campaign.status === "SENT") return { sent: 0, failed: 0, total: 0 };
    if (campaign.status === "CANCELLED")
      throw ApiError.badRequest("Campaign is cancelled");

    // Guard against duplicate execution
    const updated = await prisma.broadcastCampaign.updateMany({
      where: {
        id: campaignId,
        status: { in: ["SCHEDULED", "SENDING", "DRAFT"] },
      },
      data: { status: "SENDING" },
    });
    if (updated.count === 0) return { sent: 0, failed: 0, total: 0 };

    try {
      const where: any = { status: "ACTIVE" };
      if (campaign.audience !== "ALL") where.role = campaign.audience;

      const users = await prisma.user.findMany({
        where,
        select: { id: true, email: true, firstName: true },
      });

      if (users.length === 0) {
        await prisma.broadcastCampaign.update({
          where: { id: campaignId },
          data: { status: "SENT", sentAt: new Date(), recipientCount: 0 },
        });
        return { sent: 0, failed: 0, total: 0 };
      }

      let sent = 0;
      let failed = 0;

      for (let i = 0; i < users.length; i += CAMPAIGN_BATCH_SIZE) {
        const batch = users.slice(i, i + CAMPAIGN_BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((u) =>
            EmailService.sendBroadcastEmail(
              u.email,
              u.firstName,
              campaign.subject,
              campaign.title,
              campaign.body,
            ),
          ),
        );
        sent += results.filter((r) => r.status === "fulfilled").length;
        failed += results.filter((r) => r.status === "rejected").length;
      }

      // In-app notifications
      await prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          title: campaign.subject,
          body: campaign.body.slice(0, 200),
          type: "ADMIN_BROADCAST",
        })),
        skipDuplicates: true,
      });

      await prisma.broadcastCampaign.update({
        where: { id: campaignId },
        data: {
          status: "SENT",
          sentAt: new Date(),
          recipientCount: sent,
          failedCount: failed,
        },
      });

      return { sent, failed, total: users.length };
    } catch (err) {
      await prisma.broadcastCampaign
        .update({
          where: { id: campaignId },
          data: { status: "FAILED" },
        })
        .catch(() => {});
      throw err;
    }
  }

  /** Called by the scheduler every 60 seconds */
  static async processScheduledCampaigns() {

    await prisma.broadcastCampaign.updateMany({
      where: {
        status: "SENDING",
        updatedAt: { lt: new Date(Date.now() - 15 * 60 * 1000) },
      },
      data: { status: "FAILED" },
    });

    const due = await prisma.broadcastCampaign.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: new Date() },
      },
      select: { id: true },
    });

    for (const { id } of due) {
      try {
        await this.executeCampaign(id);
      } catch (err) {
        console.error(`Scheduled campaign ${id} failed:`, err);
      }
    }
  }

  static async listCampaigns(query: { page?: string; limit?: string }) {
    const { skip, page, limit } = getPaginationParams(query.page, query.limit);

    const [campaigns, total] = await prisma.$transaction([
      prisma.broadcastCampaign.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          admin: { select: { email: true, firstName: true, lastName: true } },
        },
      }),
      prisma.broadcastCampaign.count(),
    ]);

    return createPaginationResult(campaigns, total, page, limit);
  }

  static async cancelCampaign(campaignId: string, adminId: string) {
    const campaign = await prisma.broadcastCampaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw ApiError.notFound("Campaign not found");

    if (!["SCHEDULED", "DRAFT"].includes(campaign.status)) {
      throw ApiError.badRequest(
        "Only scheduled or draft campaigns can be cancelled",
      );
    }

    await prisma.broadcastCampaign.update({
      where: { id: campaignId },
      data: { status: "CANCELLED" },
    });

    await AdminAuthService.logActivity({
      adminId,
      action: "CANCEL_CAMPAIGN",
      entity: "BroadcastCampaign",
      entityId: campaignId,
      meta: { title: campaign.title },
    });
  }

  static async getContentStats() {
    const [featuredListings, premiumListings, premiumInvestors, broadcasts] =
      await prisma.$transaction([
        prisma.businessProfile.count({ where: { isFeatured: true } }),
        prisma.businessProfile.count({ where: { isPremium: true } }),
        prisma.investorProfile.count({ where: { isPremium: true } }),
        prisma.broadcastCampaign.count({ where: { status: "SENT" } }),
      ]);

    return {
      featuredListings,
      premiumListings,
      premiumInvestors,
      broadcasts,
      totalBroadcasts: broadcasts,
    };
  }
}
