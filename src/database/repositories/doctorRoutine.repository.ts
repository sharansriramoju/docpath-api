import { DoctorRoutine } from "../models";

export const addDoctorRoutineRepository = async (
  data: {
    doctor_id: string;
    index?: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    location_id: string;
    created_by_id: string;
  },
  t: any,
) => {
  const doctorRoutine = await DoctorRoutine.create(data, { transaction: t });
  return doctorRoutine.dataValues;
};
