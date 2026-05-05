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
    if (data.doctor_id !== data.created_by_id) {
      const doctor = await getDoctorByUserIdRepository(data.doctor_id, t);
      if (!doctor) {
        throw new Error("Doctor not found");
      }
      console.log("checking ability for user", userAbility);
      console.log(
        "subject for ability check",
        subject("DoctorRoutine", doctor),
      );
      ForbiddenError.from(userAbility).throwUnlessCan(
        "create",
        subject("DoctorRoutine", doctor),
      );
      console.log("ability check passed");
    }
    return await addDoctorRoutineRepository(data, t);
  });
};
