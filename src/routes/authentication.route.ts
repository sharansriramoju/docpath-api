import { Router } from "express";
import { isAuthenticated, validate } from "../middlewares/index.middleware";
import {
  sendOtpSchema,
  verifyOtpSchema,
} from "../validations/authentication.validation";
import {
  logoutController,
  sendOtpController,
  verifyOtpController,
} from "../controller/authentication.controller";

export default (router: Router) => {
  router.post(
    "/send-otp-login",
    validate(sendOtpSchema),
    sendOtpController,
  );
  router.post(
    "/verify-otp-login",
    validate(verifyOtpSchema),
    verifyOtpController,
  );
  router.post("/logout", isAuthenticated, logoutController);
};
