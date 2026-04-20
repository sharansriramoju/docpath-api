import { Router } from "express";
import { isAuthenticated, validate } from "../middlewares/index.middleware";
import {
  sendOtpValidation,
  verifyOtpValidation,
} from "../validations/authentication.validation";
import {
  logoutController,
  sendOtpController,
  verifyOtpController,
} from "../controller/authentication.controller";

export default (router: Router) => {
  router.post(
    "/send-otp-login",
    validate(sendOtpValidation),
    sendOtpController,
  );
  router.post(
    "/verify-otp-login",
    validate(verifyOtpValidation),
    verifyOtpController,
  );
  router.post("/logout", isAuthenticated, logoutController);
};
