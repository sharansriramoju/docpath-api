import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  sendOtpService,
  verifyOtpService,
} from "../services/authentication.service";
import jwt from "jsonwebtoken";

export const sendOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    await sendOtpService(req.body);
    res.status(200).json({ message: "OTP sent successfully", success: true });
  },
);

export const verifyOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await verifyOtpService(req.body);
    const token = jwt.sign(
      { phone: req.body.phone, user_id: user.user_id },
      process.env.HA_JWT_SECRET || "default_secret_key",
    );
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });
    req.session.user = user;
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });
    res.cookie("token", token, {
      httpOnly: process.env.HA_HTTP_ONLY === "true", // <-- dev/Postman
      secure: process.env.HA_SECURE_COOKIE == "true", // <-- dev/Postman over HTTP
      sameSite:
        (process.env.HA_COOKIE_SAME_SITE as "lax" | "strict" | "none") || "lax",
      maxAge: 2592000000,
    });
    return res.status(200).json({
      success: true,
      data: user,
      message: "Login successful",
    });
  },
);
