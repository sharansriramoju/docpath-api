import {
  getLatestOtpOfPhoneRepository,
  sendOtpRepository,
} from "../database/repositories/otp.repository";
import { getUserByHashedPhoneRepository } from "../database/repositories/users.repository";
import { NotFoundError } from "../errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";
import { decryptPII, hashForLookup } from "../helpers/index.helper";

export const sendOtpService = async (data: { phone: string }) => {
  // Check if user exists by email or phone
  const hashed_phone = hashForLookup(data.phone);
  const user = await getUserByHashedPhoneRepository(hashed_phone);
  // If user does not exist, Throw not found error
  if (!user) {
    throw new NotFoundError("User not found with the provided phone number");
  }
  // If user exists, Send OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp); // Log the generated OTP for debugging
  const hashed_otp = hashForLookup(otp);
  await sendOtpRepository({
    phone: hashed_phone,
    otp: hashed_otp,
  });
  // TODO: API to send OTP to user's phone number using third-party service like Twilio or MSG91
};

export const verifyOtpService = async (data: {
  phone: string;
  otp: string;
}) => {
  const hashed_phone = hashForLookup(data.phone);
  const otp_record = await getLatestOtpOfPhoneRepository(
    hashed_phone,
    hashForLookup(data.otp),
  );

  if (!otp_record) {
    throw new ValidationError("Invalid OTP");
  }
  const time_diff = otp_record.get("time_diff") as number;
  if (time_diff > 300) {
    throw new ValidationError("OTP expired");
  }
  const user: any = await getUserByHashedPhoneRepository(hashed_phone);

  if (!user) {
    throw new NotFoundError("User not found with the provided phone number");
  }
  user.reporting_doctors.map((doctor: any) => {
    doctor.name = decryptPII(doctor.name);
  });
  user.reported_users.map((reported_user: any) => {
    reported_user.name = decryptPII(reported_user.name);
  });
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
    reporting_doctors: user.reporting_doctors,
    locations: user.locations,
    reported_users: user.reported_users,
  };
};
