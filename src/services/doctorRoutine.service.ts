import { ForbiddenError, subject } from "@casl/ability";
import {
  addDoctorRoutineRepository,
  getDoctorRoutineRepository,
} from "../database/repositories/doctorRoutine.repository";
import { getDoctorByUserIdRepository } from "../database/repositories/users.repository";
import sequelize from "../database/sequelize";

export const addDoctorRoutineService = async (
  data: {
    doctor_id: string;
    index?: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    location_id: string;
    created_by_id: string;
  },
  userAbility: any,
) => {
  if (data.doctor_id !== data.created_by_id) {
    const doctor = await getDoctorByUserIdRepository(data.doctor_id);
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    console.log("checking ability for user", userAbility);
    console.log("subject for ability check", subject("DoctorRoutine", doctor));
    ForbiddenError.from(userAbility).throwUnlessCan(
      "create",
      subject("DoctorRoutine", doctor),
    );
    console.log("ability check passed");
  }
  return await addDoctorRoutineRepository(data);
};

export const getDoctorRoutineService = async (
  doctor_id: string,
  query: {
    index?: string;
    day_of_week?: string;
    location_ids?: string;
  },
  userAbility: any,
  not_self: boolean,
) => {
  const doctor = await getDoctorByUserIdRepository(doctor_id);
  if (!doctor) {
    throw new Error("Doctor not found");
  }
  if (not_self) {
    ForbiddenError.from(userAbility).throwUnlessCan(
      "read",
      subject("DoctorRoutine", doctor),
    );
  }
  return await getDoctorRoutineRepository(doctor_id, {
    index: query.index ? parseInt(query.index) : undefined,
    day_of_week: query.day_of_week ? parseInt(query.day_of_week) : undefined,
    location_ids: query.location_ids
      ? JSON.parse(query.location_ids)
      : undefined,
  });
};
