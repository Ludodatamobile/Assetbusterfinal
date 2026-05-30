import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { getPaginationParams, buildPaginationMeta } from "../../utils/pagination.js";

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  profileImage: true,
  role: true,
};

const assertDealParty = async (dealId: string, userId: string) => {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });

  if (!deal) throw ApiError.notFound("Deal not found.");

  if (deal.initiatorId !== userId && deal.receiverId !== userId) {
    throw ApiError.forbidden("You are not a party to this deal.");
  }

  return deal;
};

export const getDealMessages = async (
  dealId: string,
  userId: string,
  page?: string,
  limit?: string,
) => {
  await assertDealParty(dealId, userId);

  const { skip, take, page: p, limit: l } = getPaginationParams(page, limit);

  const [messages, total] = await prisma.$transaction([
    prisma.message.findMany({
      where: { dealId },
      skip,
      take,
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: userSelect },
      },
    }),
    prisma.message.count({ where: { dealId } }),
    prisma.message.updateMany({
      where: {
        dealId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    }),
  ]);

  return { messages, meta: buildPaginationMeta(total, p, l) };
};

export const sendMessage = async (
  dealId: string,
  senderId: string,
  content: string,
) => {
  const cleanContent = content?.trim();

  if (!cleanContent) throw ApiError.badRequest("Message content cannot be empty.");
  if (cleanContent.length > 5000) {
    throw ApiError.badRequest("Message too long. Maximum is 5000 characters.");
  }

  const deal = await assertDealParty(dealId, senderId);

  if (["CLOSED", "WITHDRAWN"].includes(deal.status)) {
    throw ApiError.badRequest("Cannot send messages on a closed or withdrawn deal.");
  }

  const recipientId = deal.initiatorId === senderId ? deal.receiverId : deal.initiatorId;

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        dealId,
        senderId,
        content: cleanContent,
      },
      include: {
        sender: { select: userSelect },
      },
    });

    await tx.deal.update({
      where: { id: dealId },
      data: { updatedAt: new Date() },
    });

    await tx.notification.create({
      data: {
        userId: recipientId,
        title: "New message received",
        body: cleanContent.slice(0, 140),
        type: "Message",
        link: "/dashboard?tab=enquiries",
        meta: { dealId, messageId: created.id },
      },
    });

    return created;
  });

  return message;
};

export const markMessagesRead = async (dealId: string, userId: string) => {
  await assertDealParty(dealId, userId);

  await prisma.message.updateMany({
    where: {
      dealId,
      senderId: { not: userId },
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const deals = await prisma.deal.findMany({
    where: { OR: [{ initiatorId: userId }, { receiverId: userId }] },
    select: { id: true },
  });

  return prisma.message.count({
    where: {
      dealId: { in: deals.map((deal) => deal.id) },
      senderId: { not: userId },
      isRead: false,
    },
  });
};

export const getConversations = async (userId: string) => {
  const deals = await prisma.deal.findMany({
    where: { OR: [{ initiatorId: userId }, { receiverId: userId }] },
    orderBy: { updatedAt: "desc" },
    include: {
      business: {
        select: {
          id: true,
          title: true,
          slug: true,
          industry: true,
          country: true,
          city: true,
        },
      },
      initiator: { select: userSelect },
      receiver: { select: userSelect },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      },
      _count: { select: { messages: true, documents: true } },
    },
  });

  return Promise.all(
    deals.map(async (deal) => {
      const unreadCount = await prisma.message.count({
        where: {
          dealId: deal.id,
          senderId: { not: userId },
          isRead: false,
        },
      });

      return {
        ...deal,
        unreadCount,
        counterparty: deal.initiatorId === userId ? deal.receiver : deal.initiator,
        lastMessage: deal.messages[0] ?? null,
      };
    }),
  );
};