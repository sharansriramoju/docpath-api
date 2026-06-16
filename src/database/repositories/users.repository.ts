import { Transaction } from "sequelize";
import { Location, Permission, ReportingDoctor, Role, User } from "../models";
import UserLocation from "../models/UserLocation";

export const createUserRepository = async (
  user_data: {
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
