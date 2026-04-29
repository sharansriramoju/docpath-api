import { sequelize } from "../database/models";
import {
  getLatestOtpOfPhoneRepository,
  sendOtpRepository,
} from "../database/repositories/otp.repository";
import { getUserByHashedPhoneRepository } from "../database/repositories/users.repository";
import { NotFoundError } from "../errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";
import { decryptPII, hashForLookup } from "../helpers/index.helper";

export const sendOtpService = async (data: { phone: string }) => {
  return await sequelize.transaction(async (t) => {
    // Check if user exists by email or phone
    const hashedPhone = hashForLookup(data.phone);
    const user = await getUserByHashedPhoneRepository(hashedPhone, t);
    // If user does not exist, Throw not found error
    if (!user) {
      throw new NotFoundError("User not found with the provided phone number");
    }
    // If user exists, Send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp); // Log the generated OTP for debugging
    const hashedOtp = hashForLookup(otp);
    await sendOtpRepository(
      {
        phone: hashedPhone,
        otp: hashedOtp,
      },
      t,
    );
    // TODO: API to send OTP to user's phone number using third-party service like Twilio or MSG91
  });
};

export const verifyOtpService = async (data: {
  phone: string;
  otp: string;
}) => {
  return await sequelize.transaction(async (t) => {
    const hashedPhone = hashForLookup(data.phone);
    const otpRecord = await getLatestOtpOfPhoneRepository(
      hashedPhone,
      hashForLookup(data.otp),
      t,
    );

    if (!otpRecord) {
      throw new ValidationError("Invalid OTP");
    }
    const timeDiff = otpRecord.get("time_diff") as number;
    if (timeDiff > 300) {
      throw new ValidationError("OTP expired");
    }
    const user: any = await getUserByHashedPhoneRepository(hashedPhone, t);

    if (!user) {
      throw new NotFoundError("User not found with the provided phone number");
    }
    return {
      user_id: user.user_id,
      phone: decryptPII(user.phone),
      email: user.email ? decryptPII(user.email) : undefined,
      name: decryptPII(user.name),
      role_id: user.role_id,
      profile_image_url: user.profile_image_url
        ? decryptPII(user.profile_image_url)
        : undefined,
      date_of_birth: decryptPII(user.date_of_birth),
      gender: decryptPII(user.gender),
      role: user.role,
      permissions: user.permissions,
    };
  });
};
