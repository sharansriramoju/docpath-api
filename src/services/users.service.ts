import { sequelize } from "../database/models";
import {
  addUserLocationsRepository,
  addUserReportingDoctorsRepository,
  createUserLocationsRepository,
  createUserReportingDoctorsRepository,
  createUserRepository,
  deleteUserRepository,
  getUserByHashedEmailRepository,
  getUserByHashedPhoneRepository,
  getUserByIdRepository,
  getUsersRepository,
  removeUserLocationsRepository,
  removeUserReportingDoctorsRepository,
  updateUserRepository,
} from "../database/repositories/users.repository";
import { ApiError } from "../errors/ApiError";
import { NotFoundError } from "../errors/NotFoundError";
import {
  buildNameSearchIndex,
  decryptPII,
  encryptPII,
  hashForLookup,
  hashNameSearchTerms,
} from "../helpers/index.helper";

// Decrypt the PII fields on a user (and any nested reporting doctors) so they
// can be returned in a readable form. User PII is stored encrypted at rest.
const decryptUser = (user: any) => {
  if (!user) return user;
  const plain = typeof user.toJSON === "function" ? user.toJSON() : user;
  const decrypted: any = {
    ...plain,
    name: plain.name ? decryptPII(plain.name) : plain.name,
    email: plain.email ? decryptPII(plain.email) : plain.email,
    phone: plain.phone ? decryptPII(plain.phone) : plain.phone,
    gender: plain.gender ? decryptPII(plain.gender) : plain.gender,
    date_of_birth: plain.date_of_birth
      ? decryptPII(plain.date_of_birth)
      : plain.date_of_birth,
    profile_image_url: plain.profile_image_url
      ? decryptPII(plain.profile_image_url)
      : plain.profile_image_url,
  };
  if (Array.isArray(plain.reporting_doctors)) {
    decrypted.reporting_doctors = plain.reporting_doctors.map(
      (doctor: any) => ({
        ...doctor,
        name: doctor.name ? decryptPII(doctor.name) : doctor.name,
      }),
    );
  }
  return decrypted;
};

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
    name_search_index: buildNameSearchIndex(user_data.name),
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
    return {
      user_id: user.user_id,
      name: decryptPII(user.name),
      email: user.email ? decryptPII(user.email) : undefined,
      phone: decryptPII(user.phone),
      gender: decryptPII(user.gender),
      date_of_birth: decryptPII(user.date_of_birth),
      role_id: user.role_id,
      profile_image_url: user.profile_image_url
        ? decryptPII(user.profile_image_url)
        : undefined,
      reporting_doctor_ids: user_data.reporting_doctor_ids || [],
      location_ids: user_data.location_ids || [],
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  });
};

export const getUsersService = async (query: {
  limit?: string;
  page?: string;
  role_id?: string;
  role_name?: string;
  name?: string;
  phone?: string;
  email?: string;
}) => {
  const limit = query.limit ? parseInt(query.limit, 10) : 10;
  const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;
  const role_id = query.role_id ? parseInt(query.role_id, 10) : undefined;

  // Partial (substring) name search via the trigram blind index.
  let name_terms: string[] | undefined;
  if (query.name && query.name.trim()) {
    name_terms = hashNameSearchTerms(query.name);
    // Fewer than 3 characters can't form a trigram, so no substring match.
    if (name_terms.length === 0) {
      return { count: 0, rows: [] };
    }
  }

  const result = await getUsersRepository({
    limit,
    offset,
    role_id,
    role_name: query.role_name,
    name_terms,
    // Full phone/email -> deterministic hash -> exact match.
    hashed_phone: query.phone ? hashForLookup(query.phone) : undefined,
    hashed_email: query.email ? hashForLookup(query.email) : undefined,
  });
  return { count: result.count, rows: result.rows.map(decryptUser) };
};

export const getUserByIdService = async (user_id: string) => {
  const user = await getUserByIdRepository(user_id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return decryptUser(user);
};

export const updateUserService = async (
  user_id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
    profile_image_url?: string;
    role_id?: number;
    add_location_ids?: string[];
    remove_location_ids?: string[];
    add_reporting_doctor_ids?: string[];
    remove_reporting_doctor_ids?: string[];
  },
) => {
  const existing = await getUserByIdRepository(user_id);
  if (!existing) {
    throw new NotFoundError("User not found");
  }

  // Encrypt any changed PII fields; recompute lookup hashes for phone/email.
  const update_fields: any = {};
  if (data.name !== undefined) {
    update_fields.name = encryptPII(data.name).payload;
    update_fields.name_search_index = buildNameSearchIndex(data.name);
  }
  if (data.gender !== undefined)
    update_fields.gender = encryptPII(data.gender).payload;
  if (data.date_of_birth !== undefined)
    update_fields.date_of_birth = encryptPII(data.date_of_birth).payload;
  if (data.profile_image_url !== undefined)
    update_fields.profile_image_url = encryptPII(
      data.profile_image_url,
    ).payload;
  if (data.role_id !== undefined) update_fields.role_id = data.role_id;

  let new_hashed_phone: Buffer | undefined;
  let new_hashed_email: Buffer | undefined;
  if (data.phone !== undefined) {
    new_hashed_phone = hashForLookup(data.phone);
    update_fields.phone = encryptPII(data.phone).payload;
    update_fields.hashed_phone = new_hashed_phone;
  }
  if (data.email !== undefined) {
    new_hashed_email = hashForLookup(data.email);
    update_fields.email = encryptPII(data.email).payload;
    update_fields.hashed_email = new_hashed_email;
  }

  return await sequelize.transaction(async (t) => {
    // Reject phone/email that already belong to a different user.
    if (new_hashed_phone) {
      const duplicate = await getUserByHashedPhoneRepository(
        new_hashed_phone,
        t,
      );
      if (duplicate && duplicate.user_id !== user_id) {
        throw new ApiError(409, "User with this phone number already exists");
      }
    }
    if (new_hashed_email) {
      const duplicate = await getUserByHashedEmailRepository(
        new_hashed_email,
        t,
      );
      if (duplicate && duplicate.user_id !== user_id) {
        throw new ApiError(409, "User with this email already exists");
      }
    }

    if (Object.keys(update_fields).length > 0) {
      await updateUserRepository(user_id, update_fields, t);
    }

    // Apply removals before additions so an id present in both ends up added.
    if (data.remove_location_ids && data.remove_location_ids.length > 0) {
      await removeUserLocationsRepository(user_id, data.remove_location_ids, t);
    }
    if (data.add_location_ids && data.add_location_ids.length > 0) {
      await addUserLocationsRepository(user_id, data.add_location_ids, t);
    }
    if (
      data.remove_reporting_doctor_ids &&
      data.remove_reporting_doctor_ids.length > 0
    ) {
      await removeUserReportingDoctorsRepository(
        user_id,
        data.remove_reporting_doctor_ids,
        t,
      );
    }
    if (
      data.add_reporting_doctor_ids &&
      data.add_reporting_doctor_ids.length > 0
    ) {
      await addUserReportingDoctorsRepository(
        user_id,
        data.add_reporting_doctor_ids,
        t,
      );
    }

    const updated = await getUserByIdRepository(user_id, t);
    return decryptUser(updated);
  });
};

export const deleteUserService = async (user_id: string) => {
  const user = await getUserByIdRepository(user_id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  await deleteUserRepository(user_id);
  return { user_id };
};
