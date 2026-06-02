import { ForbiddenError, subject } from "@casl/ability";
import {
  addDoctorRoutineRepository,
  getDoctorRoutineByIdRepository,
  getDoctorRoutineRepository,
  updateDoctorRoutineRepository,
} from "../database/repositories/doctorRoutine.repository";
import { getDoctorByUserIdRepository } from "../database/repositories/users.repository";

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
    ForbiddenError.from(userAbility).throwUnlessCan(
      "create",
      subject("DoctorRoutine", doctor),
    );
  }
  return await addDoctorRoutineRepository(data);
};

export const getDoctorRoutineService = async (
  doctor_id: string,
  query: {
    index?: string;
    day_of_week?: string;
    location_ids?: string;
    page?: string;
    limit?: string;
  },
  userAbility: any,
  not_self: boolean,
) => {
  const doctor = await getDoctorByUserIdRepository(doctor_id);
  if (!doctor) {
    throw new Error("Doctor not found");
  }
  if (not_self) {
    console.log("Not self, checking permissions for doctor_id:", doctor_id);
    ForbiddenError.from(userAbility).throwUnlessCan(
      "read",
      subject("DoctorRoutine", doctor),
    );
  }
  const limit = query.limit ? parseInt(query.limit) : 10;
  const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;

  return await getDoctorRoutineRepository(doctor_id, {
    limit,
    offset,
    index: query.index ? parseInt(query.index) : undefined,
    day_of_week: query.day_of_week ? parseInt(query.day_of_week) : undefined,
    location_ids: query.location_ids
      ? JSON.parse(query.location_ids)
      : undefined,
  });
};

export const getDoctorRoutineByIdService = async (
  routine_id: string,
  doctor_id: string,
  not_self: boolean,
  userAbility: any,
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
  return await getDoctorRoutineByIdRepository(routine_id);
};

export const updateDoctorRoutineService = async (
  routine_id: string,
  doctor_id: string,
  data: {
    index?: number;
    day_of_week?: number;
    start_time?: string;
    end_time?: string;
    location_id?: string;
    is_active?: boolean;
  },
  not_self: boolean,
  userAbility: any,
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
  return await updateDoctorRoutineRepository(routine_id, data);
};
