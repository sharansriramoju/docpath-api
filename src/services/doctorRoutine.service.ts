import sequelize from "../database/sequelize";

export const addDoctorRoutineService = async (data: {
  doctor_id: string;
  index?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location_id: string;
  created_by_id: string;
}) => {
  return await sequelize.transaction(async (t) => {});
};
