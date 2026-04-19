import { literal, Transaction } from "sequelize";
import { Otp } from "../models";

export const sendOtpRepository = async (
  data: {
    phone: Buffer;
    otp: Buffer;
  },
  t?: Transaction,
) => {
  await Otp.create(
    {
      phone: data.phone,
      otp: data.otp,
    },
    { transaction: t },
  );
};

export const getLatestOtpOfPhoneRepository = async (
  phone: Buffer,
  otp: Buffer,
  t?: Transaction,
) => {
  return await Otp.findOne({
    attributes: [
      "otp",
      [literal("EXTRACT(EPOCH FROM (NOW() - created_at))"), "time_diff"],
    ],
    where: {
      phone: phone, // replace with your phone variable
      otp: otp, // replace with your otp variable
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    transaction: t,
  });
};
