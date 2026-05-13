import { Op, Sequelize, Transaction } from "sequelize";
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
  t: Transaction,
) => {
  const doctorRoutine = await DoctorRoutine.create(data, { transaction: t });
  return doctorRoutine.dataValues;
};

export const getDoctorRoutineRepository = async (
  doctor_id: string,
  query: {
    index?: number;
    day_of_week?: number;
    location_ids?: string[];
  },
  t?: Transaction,
) => {
  let whereCaluse: any = { doctor_id };
  if (query.index) {
    whereCaluse.index = query.index;
  }
  if (query.day_of_week) {
    whereCaluse.day_of_week = query.day_of_week;
  }
  if (query.location_ids && query.location_ids.length > 0) {
    whereCaluse.location_id = {};
    whereCaluse.location_id[Op.in] = query.location_ids;
  }

  return await DoctorRoutine.findAndCountAll({
    attributes: {
      include: [
        [
          Sequelize.literal(`
            CASE "DoctorRoutine"."day_of_week"
              WHEN 0 THEN 'monday'
              WHEN 1 THEN 'tuesday'
              WHEN 2 THEN 'wednesday'
              WHEN 3 THEN 'thursday'
              WHEN 4 THEN 'friday'
              WHEN 5 THEN 'saturday'
              WHEN 6 THEN 'sunday'
            END
          `),
          "day",
        ],
      ],
    },
    where: whereCaluse,
    transaction: t,
  });
};
