import { sequelize } from "../database/models";
import {
  createUserLocationsRepository,
  createUserReportingDoctorsRepository,
  createUserRepository,
  getUserByHashedEmailRepository,
  getUserByHashedPhoneRepository,
} from "../database/repositories/users.repository";
import { NotFoundError } from "../errors/NotFoundError";
import { encryptPII, hashForLookup } from "../helpers/index.helper";

export const createUserService = async (user_data: {
  name: string;
  email?: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  reporting_doctor_ids?: string[];
  location_ids?: string[];
  role_id?: string;
}) => {
  const hashed_phone = hashForLookup(user_data.phone);
  const hashed_email = user_data.email
    ? hashForLookup(user_data.email)
    : undefined;
  const encrypted_user_data = {
    name: encryptPII(user_data.name).payload,
    phone: encryptPII(user_data.phone).payload,
    email: user_data.email ? encryptPII(user_data.email).payload : undefined,
    gender: encryptPII(user_data.gender).payload,
    date_of_birth: encryptPII(user_data.date_of_birth).payload,
    hashed_phone,
    hashed_email,
    role_id: user_data.role_id,
  };
  return await sequelize.transaction(async (t) => {
    const existing_user_by_phone = await getUserByHashedPhoneRepository(
      hashed_phone,
      t,
    );
    if (existing_user_by_phone) {
      throw new NotFoundError("User with this phone number already exists");
    }
    const existing_user_by_email = user_data.email
      ? await getUserByHashedEmailRepository(hashed_email!, t)
      : null;
    if (existing_user_by_email) {
      throw new NotFoundError("User with this email already exists");
    }
    const user = await createUserRepository(encrypted_user_data, t);
    await createUserLocationsRepository(
      user.user_id,
      user_data.location_ids || [],
      t,
    );
    await createUserReportingDoctorsRepository(
      user.user_id,
      user_data.reporting_doctor_ids || [],
      t,
    );
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
