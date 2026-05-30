import { createClient } from "redis";
import { env } from "./env.js";

const redisClient = createClient({
  url: env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: false,
  },
});

let redisAvailable = false;

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  redisAvailable = true;
  console.log("Redis ready");
});

redisClient.on("error", () => {
  if (redisAvailable) {
    console.log("Redis unavailable (running without cache)");
  }

  redisAvailable = false;
});

redisClient.on("end", () => {
  redisAvailable = false;
});

export const connectRedis = async (): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch {
    redisAvailable = false;
    console.log("Redis skipped (continuing without cache)");
  }
};

export const isRedisReady = () => {
  return redisAvailable && redisClient.isOpen && redisClient.isReady;
};

export const safeRedisSet = (key: string, seconds: number, value: string) => {
  if (!isRedisReady()) return;

  void redisClient.setEx(key, seconds, value).catch((error) => {
    console.error("Redis set error:", error);
  });
};

export const safeRedisDel = (key: string) => {
  if (!isRedisReady()) return;

  void redisClient.del(key).catch((error) => {
    console.error("Redis delete error:", error);
  });
};

export default redisClient;