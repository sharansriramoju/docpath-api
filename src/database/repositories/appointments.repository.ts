import { Op, QueryTypes, Transaction } from "sequelize";
import { Appointment, Location, User, sequelize } from "../models";

export const createAppointmentRepository = async (
  appointment_data: {
    patient_id: string;
    doctor_id: string;
    date: string;
    start_time: string;
    end_time: string;
    location_id: string;
    created_by_id: string;
  },
  t?: Transaction,
) => {
  const appointment = await Appointment.create(appointment_data, {
    transaction: t,
  });
  return appointment.dataValues;
};

export const getAppointmentsRepository = async (
  filters: {
    doctor_id?: string;
    location_id?: string;
    date?: string;
  },
  t?: Transaction,
) => {
  const where: Record<string, unknown> = {};
  if (filters.doctor_id) where.doctor_id = filters.doctor_id;
  if (filters.location_id) where.location_id = filters.location_id;
  if (filters.date) where.date = filters.date;

  return await Appointment.findAll({
    where,
    include: [
      {
        model: User,
        as: "patient",
        attributes: [
          "user_id",
          "name",
          "phone",
          "email",
          "gender",
          "date_of_birth",
          "profile_image_url",
        ],
      },
      {
        model: Location,
        as: "location",
        attributes: [
          "location_id",
          "name",
          "latitude",
          "longitude",
          "google_maps_url",
          "status",
        ],
      },
    ],
    order: [["start_time", "ASC"]],
    transaction: t,
  });
};

export const getAppointmentStatusCountsByLocationRepository = async (filters: {
  doctor_id: string;
  start_date?: string;
  end_date?: string;
  location_ids?: string[];
}) => {
  const replacements: Record<string, unknown> = {
    doctor_id: filters.doctor_id,
  };

  let date_condition = "";
  if (filters.start_date && filters.end_date) {
    date_condition = "AND a.date BETWEEN :start_date AND :end_date";
    replacements.start_date = filters.start_date;
    replacements.end_date = filters.end_date;
  }

  let location_condition = "";
  if (filters.location_ids) {
    location_condition = "AND a.location_id IN (:location_ids)";
    replacements.location_ids = filters.location_ids;
  }

  return await sequelize.query<{
    location_id: string;
    name: string;
    pending: number;
    completed: number;
    cancelled: number;
    total_scheduled: number;
  }>(
    `SELECT a.location_id,
            l.name,
            COUNT(*) FILTER (WHERE a.status = 'scheduled')::int AS pending,
            COUNT(*) FILTER (WHERE a.status = 'completed')::int AS completed,
            COUNT(*) FILTER (WHERE a.status = 'cancelled')::int AS cancelled,
            COUNT(*)::int AS total_scheduled
       FROM appointments a
       JOIN locations l ON l.location_id = a.location_id
      WHERE a.doctor_id = :doctor_id ${date_condition} ${location_condition}
      GROUP BY a.location_id, l.name
      ORDER BY l.name`,
    { replacements, type: QueryTypes.SELECT },
  );
};

export const getExistingScheduledAppointmentsAtDateTimeRepository = async (
  doctor_id: string,
  date: string,
  start_time: string,
  end_time: string,
  t?: Transaction,
) => {
  // Two intervals [a_start, a_end) and [b_start, b_end) overlap iff
  // a_start < b_end AND a_end > b_start. This treats times as half-open,
  // so an appointment ending exactly when another starts is NOT a conflict.
  return await Appointment.findAll({
    where: {
      doctor_id,
      date,
      status: { [Op.in]: ["scheduled", "completed"] },
      start_time: { [Op.lt]: end_time },
      end_time: { [Op.gt]: start_time },
    },
    transaction: t,
  });
};
