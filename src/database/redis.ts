// src/redisClient.ts
import { createClient } from "redis";
import "dotenv/config";

const redisClient = createClient({
  username: "default",
  password: process.env.HA_REDIS_PASSWORD,
  socket: {
    host: process.env.HA_REDIS_HOST,
    port: parseInt(process.env.HA_REDIS_PORT || "6379"),
    tls: true,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("✅ Connected to Redis");
  }
};

export default redisClient;
