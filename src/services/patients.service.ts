import { sequelize } from "../database/models";
import {
  createPatientRepository,
  deletePatientRepository,
  getPatientByIdRepository,
  getPatientByPhoneRepository,
  getPatientsRepository,
  updatePatientRepository,
} from "../database/repositories/patients.repository";
import {
  getUserByHashedEmailRepository,
  getUserByHashedPhoneRepository,
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

// Decrypt the PII fields on a patient record for a readable response.
const decryptPatient = (patient: any) => {
  if (!patient) return patient;
  const plain =
    typeof patient.toJSON === "function" ? patient.toJSON() : patient;
  return {
    ...plain,
    name_search_index: undefined,
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
};

export const createPatientService = async (data: {
  name: string;
  email?: string;
  phone: string;
  gender: string;
  date_of_birth: string;
}) => {
  const hashed_phone = hashForLookup(data.phone);
  const hashed_email = data.email ? hashForLookup(data.email) : undefined;
  const encrypted = {
    name: encryptPII(data.name).payload,
    phone: encryptPII(data.phone).payload,
    email: data.email ? encryptPII(data.email).payload : undefined,
    gender: encryptPII(data.gender).payload,
    date_of_birth: encryptPII(data.date_of_birth).payload,
    hashed_phone,
    hashed_email,
    name_search_index: buildNameSearchIndex(data.name),
  };

  return await sequelize.transaction(async (t) => {
    // Phone/email must be unique across all users, not just patients.
    const duplicate_phone = await getUserByHashedPhoneRepository(
      hashed_phone,
      t,
    );
    if (duplicate_phone) {
      throw new ApiError(409, "A user with this phone number already exists");
    }
    if (data.email) {
      const duplicate_email = await getUserByHashedEmailRepository(
        hashed_email!,
        t,
      );
      if (duplicate_email) {
        throw new ApiError(409, "A user with this email already exists");
      }
    }

    const patient = await createPatientRepository(encrypted, t);
    const created = await getPatientByIdRepository(patient.user_id, t);
    return decryptPatient(created);
  });
};

export const getPatientsService = async (query: {
  limit?: string;
  page?: string;
  name?: string;
  phone?: string;
  email?: string;
}) => {
  const limit = query.limit ? parseInt(query.limit, 10) : 10;
  const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;

  // Partial (substring) name search via the trigram blind index.
  let name_terms: string[] | undefined;
  if (query.name && query.name.trim()) {
    name_terms = hashNameSearchTerms(query.name);
    // Fewer than 3 characters can't form a trigram, so no substring match.
    if (name_terms.length === 0) {
      return { count: 0, rows: [] };
    }
  }

  const result = await getPatientsRepository({
    limit,
    offset,
    name_terms,
    hashed_phone: query.phone ? hashForLookup(query.phone) : undefined,
    hashed_email: query.email ? hashForLookup(query.email) : undefined,
  });
  return { count: result.count, rows: result.rows.map(decryptPatient) };
};

export const getPatientByIdService = async (user_id: string) => {
  const patient = await getPatientByIdRepository(user_id);
  if (!patient) {
    throw new NotFoundError("Patient not found");
  }
  return decryptPatient(patient);
};

export const getPatientByPhoneService = async (phone: string) => {
  const hashed_phone = hashForLookup(phone);
  const patient = await getPatientByPhoneRepository(hashed_phone);
  if (!patient) {
    throw new NotFoundError("Patient not found");
  }
  return decryptPatient(patient);
};

export const updatePatientService = async (
  user_id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
    profile_image_url?: string;
  },
) => {
  const existing = await getPatientByIdRepository(user_id);
  if (!existing) {
    throw new NotFoundError("Patient not found");
  }

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
    if (new_hashed_phone) {
      const duplicate = await getUserByHashedPhoneRepository(
        new_hashed_phone,
        t,
      );
      if (duplicate && duplicate.user_id !== user_id) {
        throw new ApiError(409, "A user with this phone number already exists");
      }
    }
    if (new_hashed_email) {
      const duplicate = await getUserByHashedEmailRepository(
        new_hashed_email,
        t,
      );
      if (duplicate && duplicate.user_id !== user_id) {
        throw new ApiError(409, "A user with this email already exists");
      }
    }

    if (Object.keys(update_fields).length > 0) {
      await updatePatientRepository(user_id, update_fields, t);
    }
    const updated = await getPatientByIdRepository(user_id, t);
    return decryptPatient(updated);
  });
};

export const deletePatientService = async (user_id: string) => {
  const patient = await getPatientByIdRepository(user_id);
  if (!patient) {
    throw new NotFoundError("Patient not found");
  }
  await deletePatientRepository(user_id);
  return { user_id };
};
