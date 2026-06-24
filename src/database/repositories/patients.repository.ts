import { Op, Transaction } from "sequelize";
import { Role, User } from "../models";
import { PATIENT_ROLE_ID } from "../../config/constants";

// Patients are users with the patient role and (unlike staff users) no tagged
// locations or reporting doctors, so the role is forced here.
export const createPatientRepository = async (
  data: {
    name: string;
    email?: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    hashed_phone: Buffer;
    hashed_email?: Buffer;
    name_search_index?: string[];
  },
  t?: Transaction,
) => {
  const patient = await User.create(
    { ...data, role_id: PATIENT_ROLE_ID },
    { transaction: t },
  );
  return patient.dataValues;
};

export const getPatientsRepository = async (filters: {
  limit?: number;
  offset?: number;
  name_terms?: string[];
  hashed_phone?: Buffer;
  hashed_email?: Buffer;
}) => {
  const where: any = { role_id: PATIENT_ROLE_ID };
  if (filters.hashed_phone) where.hashed_phone = filters.hashed_phone;
  if (filters.hashed_email) where.hashed_email = filters.hashed_email;
  // Partial (substring) name search via the trigram blind index.
  if (filters.name_terms && filters.name_terms.length > 0) {
    where.name_search_index = { [Op.contains]: filters.name_terms };
  }

  return await User.findAndCountAll({
    where,
    attributes: {
      exclude: ["hashed_phone", "hashed_email", "name_search_index"],
    },
    order: [["created_at", "DESC"]],
    limit: filters.limit,
    offset: filters.offset,
  });
};

export const getPatientByPhoneRepository = async (
  hashed_phone: Buffer,
  t?: Transaction,
) => {
  return await User.findOne({
    where: { hashed_phone, role_id: PATIENT_ROLE_ID },
    attributes: { exclude: ["hashed_phone", "hashed_email"] },
    include: [{ model: Role, as: "role", attributes: ["role_id", "name"] }],
    transaction: t,
  });
};

export const getPatientByIdRepository = async (
  user_id: string,
  t?: Transaction,
) => {
  return await User.findOne({
    where: { user_id, role_id: PATIENT_ROLE_ID },
    attributes: { exclude: ["hashed_phone", "hashed_email"] },
    include: [{ model: Role, as: "role", attributes: ["role_id", "name"] }],
    transaction: t,
  });
};

export const updatePatientRepository = async (
  user_id: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    profile_image_url: string;
    hashed_phone: Buffer;
    hashed_email: Buffer;
    name_search_index: string[];
  }>,
  t?: Transaction,
) => {
  await User.update(data, {
    where: { user_id, role_id: PATIENT_ROLE_ID },
    transaction: t,
  });
};

export const deletePatientRepository = async (
  user_id: string,
  t?: Transaction,
) => {
  return await User.destroy({
    where: { user_id, role_id: PATIENT_ROLE_ID },
    transaction: t,
  });
};
