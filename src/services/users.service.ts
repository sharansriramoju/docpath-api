import { sequelize } from "../database/models";
import {
  createUserRepository,
  getUserByHashedEmailRepository,
  getUserByHashedPhoneRepository,
} from "../database/repositories/users.repository";
import { NotFoundError } from "../errors/NotFoundError";
import { encryptPII, hashForLookup } from "../helpers/index.helper";

export const createUserService = async (userData: {
  name: string;
  email?: string;
  phone: string;
  gender: string;
  date_of_birth: string;
}) => {
  const hashed_phone = hashForLookup(userData.phone);
  const hashed_email = userData.email
    ? hashForLookup(userData.email)
    : undefined;
  const encryptedUserData = {
    name: encryptPII(userData.name).payload,
    phone: encryptPII(userData.phone).payload,
    email: userData.email ? encryptPII(userData.email).payload : undefined,
    gender: encryptPII(userData.gender).payload,
    date_of_birth: encryptPII(userData.date_of_birth).payload,
    hashed_phone,
    hashed_email,
  };
  return await sequelize.transaction(async (t) => {
    const existingUserByPhone = await getUserByHashedPhoneRepository(
      hashed_phone,
      t,
    );
    if (existingUserByPhone) {
      throw new NotFoundError("User with this phone number already exists");
    }
    const existingUserByEmail = userData.email
      ? await getUserByHashedEmailRepository(hashed_email!, t)
      : null;
    if (existingUserByEmail) {
      throw new NotFoundError("User with this email already exists");
    }
    const user = await createUserRepository(encryptedUserData, t);
    return user;
  });
};

export const getUserByPhoneService = async (phone: string) => {
  const hashed_phone = hashForLookup(phone);
  const user = await getUserByHashedPhoneRepository(hashed_phone);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};
