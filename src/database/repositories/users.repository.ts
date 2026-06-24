import { Op, Transaction } from "sequelize";
import { Location, Permission, ReportingDoctor, Role, User } from "../models";
import UserLocation from "../models/UserLocation";
import { PATIENT_ROLE_ID } from "../../config/constants";

export const createUserRepository = async (
  user_data: {
    name: string;
    email?: string;
    date_of_birth: string;
    phone: string;
    gender: string;
    hashed_phone: Buffer;
    hashed_email?: Buffer;
    name_search_index?: string[];
  },
  t?: Transaction,
) => {
  const user = await User.create(user_data, { transaction: t });
  return user.dataValues;
};

export const createUserLocationsRepository = async (
  user_id: string,
  location_ids: string[],
  t?: Transaction,
) => {
  const user_locations = location_ids.map((location_id) => ({
    user_id,
    location_id,
  }));
  await UserLocation.bulkCreate(user_locations, { transaction: t });
};

export const createUserReportingDoctorsRepository = async (
  user_id: string,
  doctor_ids: string[],
  t?: Transaction,
) => {
  const user_doctors = doctor_ids.map((doctor_id) => ({
    user_id,
    doctor_id,
  }));
  await ReportingDoctor.bulkCreate(user_doctors, { transaction: t });
};

export const getUserByHashedPhoneRepository = async (
  hashed_phone: Buffer,
  t?: Transaction,
) => {
  const user = await User.findOne({
    where: { hashed_phone: hashed_phone },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["role_id", "name"],
      },
      {
        model: Permission,
        as: "permissions",
        through: {
          attributes: ["role_id", "permission_id", "conditions", "scope"],
        },
        attributes: ["permission_id", "action", "subject", "created_at"],
      },
      {
        model: Location,
        as: "locations",
        through: { attributes: ["location_id", "user_id"] },
        attributes: ["location_id", "name"],
        where: { status: "active" },
        required: false,
      },
      {
        model: User,
        as: "reporting_doctors",
        through: { attributes: ["user_id", "doctor_id"] },
        attributes: ["user_id", "name"],
      },
      {
        model: User,
        as: "reported_users",
        through: { attributes: ["user_id", "doctor_id"] },
        attributes: ["user_id", "name"],
      },
    ],
    transaction: t,
  });
  return user;
};

export const getUsersRepository = async (filters: {
  limit?: number;
  offset?: number;
  role_id?: number;
  role_name?: string;
  name_terms?: string[];
  hashed_phone?: Buffer;
  hashed_email?: Buffer;
}) => {
  const where: any = {};
  if (filters.role_id !== undefined) where.role_id = filters.role_id;
  // Exact-match lookups on the deterministic HMAC hashes of phone/email.
  if (filters.hashed_phone) where.hashed_phone = filters.hashed_phone;
  if (filters.hashed_email) where.hashed_email = filters.hashed_email;
  // Search by role name (case-insensitive). Excludes users with no role.
  if (filters.role_name) {
    where["$role.name$"] = { [Op.iLike]: `%${filters.role_name}%` };
  }
  // Partial (substring) name search via the trigram blind index: the user's
  // index array must contain every hashed query trigram.
  if (filters.name_terms && filters.name_terms.length > 0) {
    where.name_search_index = { [Op.contains]: filters.name_terms };
  }

  // Exclude patients by role id (cheap integer compare on the base table, no
  // string match on the joined role). Users with no role are kept.
  where[Op.or] = [
    { role_id: { [Op.ne]: PATIENT_ROLE_ID } },
    { role_id: { [Op.is]: null } },
  ];

  return await User.findAndCountAll({
    where,
    attributes: {
      exclude: ["hashed_phone", "hashed_email", "name_search_index"],
    },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["role_id", "name"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
    limit: filters.limit,
    offset: filters.offset,
    distinct: true,
    subQuery: false,
  });
};

export const getUserByIdRepository = async (
  user_id: string,
  t?: Transaction,
) => {
  return await User.findByPk(user_id, {
    attributes: {
      exclude: ["hashed_phone", "hashed_email", "name_search_index"],
    },
    include: [
      { model: Role, as: "role", attributes: ["role_id", "name"] },
      {
        model: Location,
        as: "locations",
        through: { attributes: [] },
        attributes: ["location_id", "name"],
      },
      {
        model: User,
        as: "reporting_doctors",
        through: { attributes: [] },
        attributes: ["user_id", "name"],
      },
    ],
    transaction: t,
  });
};

export const updateUserRepository = async (
  user_id: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    profile_image_url: string;
    role_id: number;
    hashed_phone: Buffer;
    hashed_email: Buffer;
    name_search_index: string[];
  }>,
  t?: Transaction,
) => {
  await User.update(data, { where: { user_id }, transaction: t });
};

// Add location mappings to a user. Existing rows for the given location_ids
// are cleared first so no duplicates are created.
export const addUserLocationsRepository = async (
  user_id: string,
  location_ids: string[],
  t?: Transaction,
) => {
  await UserLocation.destroy({
    where: { user_id, location_id: location_ids },
    transaction: t,
  });
  await UserLocation.bulkCreate(
    location_ids.map((location_id) => ({ user_id, location_id })),
    { transaction: t },
  );
};

export const removeUserLocationsRepository = async (
  user_id: string,
  location_ids: string[],
  t?: Transaction,
) => {
  await UserLocation.destroy({
    where: { user_id, location_id: location_ids },
    transaction: t,
  });
};

// Add reporting-doctor mappings to a user (clears the given doctor_ids first).
export const addUserReportingDoctorsRepository = async (
  user_id: string,
  doctor_ids: string[],
  t?: Transaction,
) => {
  await ReportingDoctor.destroy({
    where: { user_id, doctor_id: doctor_ids },
    transaction: t,
  });
  await ReportingDoctor.bulkCreate(
    doctor_ids.map((doctor_id) => ({ user_id, doctor_id })),
    { transaction: t },
  );
};

export const removeUserReportingDoctorsRepository = async (
  user_id: string,
  doctor_ids: string[],
  t?: Transaction,
) => {
  await ReportingDoctor.destroy({
    where: { user_id, doctor_id: doctor_ids },
    transaction: t,
  });
};

export const deleteUserRepository = async (user_id: string, t?: Transaction) => {
  return await User.destroy({ where: { user_id }, transaction: t });
};

export const getUserByHashedEmailRepository = async (
  hashed_email: Buffer,
  t?: Transaction,
) => {
  const user = await User.findOne({
    where: { hashed_email: hashed_email },
    transaction: t,
  });
  return user;
};

export const getDoctorByUserIdRepository = async (
  user_id: string,
  t?: Transaction,
) => {
  const user = await User.findByPk(user_id, {
    transaction: t,
  });
  return user;
};

export const getUserWithRoleByIdRepository = async (
  user_id: string,
  t?: Transaction,
) => {
  const user = await User.findByPk(user_id, {
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
