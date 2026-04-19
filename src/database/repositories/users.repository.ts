import { Transaction } from "sequelize";
import { Role, User } from "../models";

export const createUserRepository = async (
  userData: {
    name: string;
    email?: string;
    date_of_birth: string;
    phone: string;
    gender: string;
    hashed_phone: Buffer;
    hashed_email?: Buffer;
  },
  t?: Transaction,
) => {
  const user = await User.create(userData, { transaction: t });
  return user.dataValues;
};

export const getUserByHashedPhoneRepository = async (
  hashedPhone: Buffer,
  t?: Transaction,
) => {
  const user = await User.findOne({
    where: { hashed_phone: hashedPhone },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["role_id", "name"],
      },
    ],
    transaction: t,
  });
  return user;
};

export const getUserByHashedEmailRepository = async (
  hashedEmail: Buffer,
  t?: Transaction,
) => {
  const user = await User.findOne({
    where: { hashed_email: hashedEmail },
    transaction: t,
  });
  return user;
};
