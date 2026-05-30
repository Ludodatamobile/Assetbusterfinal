import type { Server, Socket } from "socket.io";
import { prisma } from "../../config/prisma.js";
import { sendMessage } from "./message.service.js";

interface TypingPayload {
  dealId: string;
}

interface MessagePayload {
  dealId: string;
  content: string;
}

interface ReadPayload {
  dealId: string;
}

type DealRoomPayload = string | { dealId?: string };

const getDealId = (payload: DealRoomPayload) => {
  if (typeof payload === "string") return payload;
  return payload?.dealId || "";
};

const assertParty = async (dealId: string, userId: string) => {
  if (!dealId) throw new Error("Deal ID is required.");

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
  });

  if (!deal) {
    throw new Error("Deal not found.");
  }

  if (deal.initiatorId !== userId && deal.receiverId !== userId) {
    throw new Error("You are not a party to this deal.");
  }

  return deal;
};

export const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;

    if (!user?.id) {
      socket.disconnect(true);
      return;
    }

    socket.join(`user:${user.id}`);

    socket.broadcast.emit("user:online", {
      userId: user.id,
    });

    socket.on("deal:join", async (payload: DealRoomPayload, ack?: Function) => {
      try {
        const dealId = getDealId(payload);
        await assertParty(dealId, user.id);

        socket.join(`deal:${dealId}`);

        ack?.({
          success: true,
          dealId,
        });
      } catch (err: any) {
        ack?.({
          success: false,
          error: err.message,
        });
      }
    });

    socket.on("deal:leave", (payload: DealRoomPayload) => {
      const dealId = getDealId(payload);
      if (dealId) socket.leave(`deal:${dealId}`);
    });

    socket.on("message:send", async (payload: MessagePayload, ack?: Function) => {
      try {
        const deal = await assertParty(payload.dealId, user.id);

        const message = await sendMessage(
          payload.dealId,
          user.id,
          payload.content,
        );

        io.to(`deal:${payload.dealId}`).emit("message:new", message);

        const recipientId =
          deal.initiatorId === user.id ? deal.receiverId : deal.initiatorId;

        io.to(`user:${recipientId}`).emit("notification:new", {
          type: "message",
          title: `New message from ${user.firstName || "a member"}`,
          body:
            payload.content.slice(0, 140) +
            (payload.content.length > 140 ? "..." : ""),
          dealId: payload.dealId,
          messageId: message.id,
        });

        ack?.({
          success: true,
          message,
        });
      } catch (err: any) {
        ack?.({
          success: false,
          error: err.message,
        });
      }
    });

    socket.on("typing:start", async (payload: TypingPayload) => {
      try {
        await assertParty(payload.dealId, user.id);

        socket.to(`deal:${payload.dealId}`).emit("typing:start", {
          userId: user.id,
          firstName: user.firstName,
        });
      } catch (err) {
        console.error("Typing start error:", err);
      }
    });

    socket.on("typing:stop", async (payload: TypingPayload) => {
      try {
        await assertParty(payload.dealId, user.id);

        socket.to(`deal:${payload.dealId}`).emit("typing:stop", {
          userId: user.id,
        });
      } catch (err) {
        console.error("Typing stop error:", err);
      }
    });

    socket.on("message:read", async (payload: ReadPayload) => {
      try {
        await assertParty(payload.dealId, user.id);

        await prisma.message.updateMany({
          where: {
            dealId: payload.dealId,
            senderId: { not: user.id },
            isRead: false,
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

        socket.to(`deal:${payload.dealId}`).emit("message:read", {
          dealId: payload.dealId,
          readBy: user.id,
        });
      } catch (err) {
        console.error("Socket read error:", err);
      }
    });

    socket.on("disconnect", () => {
      socket.broadcast.emit("user:offline", {
        userId: user.id,
      });
    });
  });
};