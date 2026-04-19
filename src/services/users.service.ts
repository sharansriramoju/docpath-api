import { sequelize } from "../database/models";
import { createUserRepository } from "../database/repositories/users.repository";
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
    const user = await createUserRepository(encryptedUserData);
    return user;
  });
};
