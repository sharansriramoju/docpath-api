// src/index.ts
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import crypto from "crypto";
import "dotenv/config";
import { sequelize } from "./database/models/index";
import { runSeeders } from "./database/seeder";
import session from "express-session";
// import admin from "firebase-admin";
import { RedisStore } from "connect-redis";
import redisClient, {
  connectRedis as connectRedisClient,
} from "./database/redis";
import router from "./routes/index.route";
// import "./jobs/listings.cronjob";
// import "./jobs/interactions.cronjob";

const port = 3000;
const host = "0.0.0.0";
const app = express();
const server = http.createServer(app);

// --- Core app/middleware setup --- //
app.set("trust proxy", 1); // important for secure cookies behind proxy

// Body parsers / static
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use("/static", express.static("src"));

// --- Redis + session setup --- //

// Kick off Redis connection (no need to await – node-redis queues commands)
connectRedisClient().catch((err) => {
  console.error("❌ Failed to connect to Redis:", err);
});

// Create the Redis session store instance
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "sess:", // optional
  ttl: 86400, // optional (seconds)
});

// Attach express-session with Redis store
app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET || "your_super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: process.env.DC_HTTP_ONLY === "true",
      secure: process.env.DC_SECURE_COOKIE === "true",
      sameSite:
        (process.env.DC_COOKIE_SAME_SITE as "lax" | "strict" | "none") || "lax",
      maxAge: 2592000000, // 30 days
    },
  }),
);

// --- CORS (before routes) --- //
const allowedOrigins = ["http://localhost:49631", "http://localhost:5173"];

app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

// --- Firebase --- //
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
// });

// --- DB connection (can stay async IIFE) --- //
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
})();

// --- Routes --- //
app.get("/health", async (req, res) => {
  const secret = crypto.randomBytes(64).toString("base64");
  res.send("Server is runningasdfasdfasdfa! : " + secret);
});

app.use("/api", router());

// --- Start server --- //
server.listen(port, host, async () => {
  // await runMigrations();
  try {
    await sequelize.sync({ alter: true });
    await runSeeders();
  } catch (error) {
    console.error("❌ Failed to run migrations:", error);
  }
  console.log(`Server is running on port ${port}`);
});

// build test push
