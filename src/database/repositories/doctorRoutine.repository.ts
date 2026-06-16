import { Op, Sequelize, Transaction } from "sequelize";
import { DoctorRoutine, Location } from "../models";
import { NotFoundError } from "../../errors/NotFoundError";

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
  t?: Transaction,
) => {
  const doctor_routine = await DoctorRoutine.create(data, { transaction: t });
  return doctor_routine.dataValues;
};

export const getDoctorRoutineRepository = async (
  doctor_id: string,
  query: {
    offset: number;
    limit: number;
    index?: number;
    day_of_week?: number;
    location_ids?: string[];
  },
  t?: Transaction,
) => {
  let where_clause: any = { doctor_id, "$location.status$": "active" };
  if (query.index) {
    where_clause.index = query.index;
  }
  if (query.day_of_week !== undefined) {
    where_clause.day_of_week = query.day_of_week;
  }
  if (query.location_ids && query.location_ids.length > 0) {
    where_clause.location_id = {};
    where_clause.location_id[Op.in] = query.location_ids;
  }

  return await DoctorRoutine.findAndCountAll({
    attributes: {
      include: [
        [
          Sequelize.literal(`
            CASE "DoctorRoutine"."day_of_week"
            WHEN 0 THEN 'sunday'
              WHEN 1 THEN 'monday'
              WHEN 2 THEN 'tuesday'
              WHEN 3 THEN 'wednesday'
              WHEN 4 THEN 'thursday'
              WHEN 5 THEN 'friday'
              WHEN 6 THEN 'saturday'
            END
          `),
          "day",
        ],
      ],
    },
    include: [
      {
        model: Location,
        as: "location",
        attributes: ["location_id", "name"],
      },
    ],

    where: where_clause,
    transaction: t,
    limit: query.limit,
    offset: query.offset,
  });
};

export const getDoctorRoutineByIdRepository = async (
  routine_id: string,
  t?: Transaction,
) => {
  const doctor_routine = await DoctorRoutine.findOne({
    where: { routine_id },
    attributes: {
      include: [
        [
          Sequelize.literal(`
            CASE "DoctorRoutine"."day_of_week"
              WHEN 1 THEN 'monday'
              WHEN 2 THEN 'tuesday'
              WHEN 3 THEN 'wednesday'
              WHEN 4 THEN 'thursday'
              WHEN 5 THEN 'friday'
              WHEN 6 THEN 'saturday'
              WHEN 0 THEN 'sunday'
            END
          `),
          "day",
        ],
      ],
    },
    include: [
      {
        model: Location,
        as: "location",
        attributes: ["location_id", "name"],
      },
    ],
    transaction: t,
  });
  return doctor_routine;
};

export const updateDoctorRoutineRepository = async (
  routine_id: string,
  data: {
    index?: number;
    day_of_week?: number;
    start_time?: string;
    end_time?: string;
    location_id?: string;
    is_active?: boolean;
  },
  t?: Transaction,
) => {
  const [affected_count, updated_location] = await DoctorRoutine.update(data, {
    where: { routine_id },
    transaction: t,
    returning: true,
  });
  if (affected_count === 0) {
    throw new NotFoundError("Routine Not Found");
  }
  return updated_location[0];
};
