import { User } from "../models";

export const createUserRepository = async (userData: {
  name: string;
  email?: string;
  date_of_birth: string;
  phone: string;
  gender: string;
  hashed_phone: Buffer;
  hashed_email?: Buffer;
}) => {
  const user = await User.create(userData);
  return user.dataValues;
};
