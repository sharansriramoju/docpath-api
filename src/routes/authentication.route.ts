import { Router } from "express";
import { isAuthenticated, validate } from "../middlewares/index.middleware";
import {
  sendOtpRateLimiter,
  verifyOtpRateLimiter,
} from "../middlewares/rateLimit.middleware";
import {
  sendOtpSchema,
  verifyOtpSchema,
} from "../validations/authentication.validation";
import {
  getMeController,
  logoutController,
  sendOtpController,
  verifyOtpController,
} from "../controller/authentication.controller";

export default (router: Router) => {
  router.post(
    "/send-otp-login",
    sendOtpRateLimiter,
    validate(sendOtpSchema),
    sendOtpController,
  );
  router.post(
    "/verify-otp-login",
    verifyOtpRateLimiter,
    validate(verifyOtpSchema),
    verifyOtpController,
  );
  router.get("/auth/me", isAuthenticated, getMeController);
  router.post("/logout", isAuthenticated, logoutController);
};
