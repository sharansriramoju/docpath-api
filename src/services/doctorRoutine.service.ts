import { ForbiddenError, subject } from "@casl/ability";
import { addDoctorRoutineRepository } from "../database/repositories/doctorRoutine.repository";
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
  return await sequelize.transaction(async (t) => {
    const doctor = await getDoctorByUserIdRepository(data.doctor_id, t);
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    ForbiddenError.from(userAbility).throwUnlessCan(
      "create",
      subject("DoctorRoutine", doctor),
    );
    return await addDoctorRoutineRepository(data, t);
  });
};
