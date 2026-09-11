import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { socketHandler } from "./modules/messaging/socket.handler.js";
import { AdminContentService } from "./admin/content/adminContent.service.js";
import { verifyAccessToken } from "./utils/generateToken.js";
import { prisma } from "./config/prisma.js";
import {franchCrawler} from "./modules/crawler/crawler.franch.service.js";

const PORT = process.env.PORT || 5000;
const CAMPAIGN_POLL_MS = 60_000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
].filter(Boolean) as string[];

const startCampaignScheduler = () => {
  AdminContentService.processScheduledCampaigns().catch((err) =>
    console.error("Campaign scheduler boot-run error:", err),
  );

  setInterval(async() => {
    AdminContentService.processScheduledCampaigns().catch((err) =>
      console.error("Campaign scheduler error:", err),
    );
    
    try{
     await franchCrawler();
     
    }catch(err){
      console.error("Franchise crawler error:", err);
    } 

   

  }, CAMPAIGN_POLL_MS);

  console.log("✓ Campaign scheduler active (60s poll)");
};

const startServer = async () => {
  await connectDB();

  connectRedis().catch(() => {
    console.log("Redis not available (continuing without cache)");
  });

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by Socket.IO CORS"));
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const rawToken =
        socket.handshake.auth?.token || socket.handshake.headers.authorization;

      const token =
        typeof rawToken === "string" && rawToken.startsWith("Bearer ")
          ? rawToken.slice(7)
          : rawToken;

      if (!token || typeof token !== "string") {
        return next(new Error("Socket auth required"));
      }

      const payload = verifyAccessToken(token);

      if (payload.type !== "user") {
        return next(new Error("User socket required"));
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          profileImage: true,
        },
      });

      if (!user || user.status !== "ACTIVE") {
        return next(new Error("Invalid socket user"));
      }

      (socket as any).user = {
        ...user,
        type: "user",
      };

      return next();
    } catch {
      return next(new Error("Invalid socket token"));
    }
  });

  socketHandler(io);

  httpServer.listen(PORT, () => {
    console.log(`✓ Asset Busters API on port ${PORT}`);
    console.log("✓ Socket.IO active");
  });

  startCampaignScheduler();
};

startServer();