import { Request, Response, NextFunction } from "express";
import redisClient from "../database/redis";

/**
 * Sliding-window rate limiter backed by a Redis sorted set.
 *
 * Each request is recorded as a unique member scored by its timestamp. On
 * every call we (1) drop members older than the window, (2) add the current
 * request, (3) count what remains, and (4) refresh the key's TTL. The count
 * is an accurate rolling-window total, so there is no fixed-window boundary
 * burst, and because the state lives in Redis it is shared across all app
 * instances.
 */
export const rateLimit = (options: {
  window_ms: number;
  max: number;
  key_prefix?: string;
  key_generator?: (req: Request) => string;
  message?: string;
  // When the limiter cannot verify the count (e.g. Redis is down):
  //   false (default) → fail closed: reject with 503.
  //   true            → fail open: let the request through.
  fail_open?: boolean;
}) => {
  const key_prefix = options.key_prefix ?? "global";
  const message =
    options.message ?? "Too many requests, please try again later.";
  const fail_open = options.fail_open ?? false;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const now = Date.now();
      const window_start = now - options.window_ms;
      const identifier = options.key_generator
        ? options.key_generator(req)
        : (req.ip ?? "unknown");
      const key = `rl:${key_prefix}:${identifier}`;

      const results = await redisClient
        .multi()
        .zRemRangeByScore(key, 0, window_start)
        .zAdd(key, { score: now, value: `${now}:${Math.random()}` })
        .zCard(key)
        .pExpire(key, options.window_ms)
        .exec();

      // zCard is the third command in the pipeline.
      const count = Number(results[2]);

      res.setHeader("X-RateLimit-Limit", options.max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, options.max - count));

      if (count > options.max) {
        res.setHeader("Retry-After", Math.ceil(options.window_ms / 1000));
        return res.status(429).json({ success: false, message });
      }

      return next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      if (fail_open) {
        // A Redis hiccup must not take this route down.
        return next();
      }
      // Fail closed: reject rather than let the request through unthrottled.
      return res.status(503).json({
        success: false,
        message: "Service temporarily unavailable. Please try again later.",
      });
    }
  };
};

// Generous catch-all limit for the entire API surface, keyed by client IP.
// Fails open so a Redis outage degrades protection without downing the API.
export const apiRateLimiter = rateLimit({
  window_ms: 60_000,
  max: 100,
  key_prefix: "api",
  fail_open: true,
});

// Strict limit to curb OTP/SMS abuse (cost + SMS-bombing). Keyed by phone
// number, falling back to IP if the body is not present yet.
export const sendOtpRateLimiter = rateLimit({
  window_ms: 15 * 60_000,
  max: 5,
  key_prefix: "send-otp",
  key_generator: (req) => req.body?.phone ?? req.ip ?? "unknown",
  message:
    "Too many OTP requests for this number. Please try again in a while.",
  fail_open: false,
});

// Strict limit to make OTP brute-forcing infeasible. Keyed by phone number.
export const verifyOtpRateLimiter = rateLimit({
  window_ms: 15 * 60_000,
  max: 10,
  key_prefix: "verify-otp",
  key_generator: (req) => req.body?.phone ?? req.ip ?? "unknown",
  message: "Too many verification attempts. Please try again in a while.",
  fail_open: false,
});
