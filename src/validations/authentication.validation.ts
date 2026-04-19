import z from "zod";

export const sendOtpValidation = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

export const verifyOtpValidation = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  otp: z
    .string()
    .min(4, "OTP must be at least 4 digits")
    .max(6, "OTP must be at most 6 digits"),
});
