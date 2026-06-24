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
    reason?: string;
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

// Status-count breakdown grouped per day, per location, per doctor over the
// requested period. doctor_name is returned encrypted (decrypt in the service).
export const getAppointmentOverviewCountsRepository = async (filters: {
  start_date?: string;
  end_date?: string;
  doctor_ids?: string[];
  location_ids?: string[];
}) => {
  const replacements: Record<string, unknown> = {};
  const conditions: string[] = [];

  if (filters.start_date && filters.end_date) {
    conditions.push("a.date BETWEEN :start_date AND :end_date");
    replacements.start_date = filters.start_date;
    replacements.end_date = filters.end_date;
  }
  if (filters.doctor_ids) {
    conditions.push("a.doctor_id IN (:doctor_ids)");
    replacements.doctor_ids = filters.doctor_ids;
  }
  if (filters.location_ids) {
    conditions.push("a.location_id IN (:location_ids)");
    replacements.location_ids = filters.location_ids;
  }
  const where_clause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  return await sequelize.query<{
    date: string;
    location_id: string;
    location_name: string;
    doctor_id: string;
    doctor_name: string;
    pending: number;
    completed: number;
    cancelled: number;
    total_scheduled: number;
  }>(
    `SELECT a.date::text AS date,
            a.location_id,
            l.name AS location_name,
            a.doctor_id,
            d.name AS doctor_name,
            COUNT(*) FILTER (WHERE a.status = 'scheduled')::int AS pending,
            COUNT(*) FILTER (WHERE a.status = 'completed')::int AS completed,
            COUNT(*) FILTER (WHERE a.status = 'cancelled')::int AS cancelled,
            COUNT(*)::int AS total_scheduled
       FROM appointments a
       JOIN locations l ON l.location_id = a.location_id
       JOIN users d ON d.user_id = a.doctor_id
       ${where_clause}
      GROUP BY a.date, a.location_id, l.name, a.doctor_id, d.name
      ORDER BY a.date ASC, l.name ASC, a.doctor_id ASC`,
    { replacements, type: QueryTypes.SELECT },
  );
};

export const getAppointmentByIdRepository = async (
  appointment_id: string,
  t?: Transaction,
) => {
  return await Appointment.findByPk(appointment_id, { transaction: t });
};

export const updateAppointmentRepository = async (
  appointment_id: string,
  data: Partial<{
    date: string;
    start_time: string;
    end_time: string;
    status: "scheduled" | "completed" | "cancelled";
    reason: string;
    doctor_notes: string;
    prescription: string;
  }>,
  t?: Transaction,
) => {
  const [, updated] = await Appointment.update(data, {
    where: { appointment_id },
    transaction: t,
    returning: true,
  });
  return updated[0];
};

export const getExistingScheduledAppointmentsAtDateTimeRepository = async (
  params: {
    doctor_id: string;
    date: string;
    start_time: string;
    end_time: string;
    // Exclude this appointment from the overlap check (used when rescheduling).
    exclude_appointment_id?: string;
  },
  t?: Transaction,
) => {
  // Two intervals [a_start, a_end) and [b_start, b_end) overlap iff
  // a_start < b_end AND a_end > b_start. This treats times as half-open,
  // so an appointment ending exactly when another starts is NOT a conflict.
  const where: Record<string, unknown> = {
    doctor_id: params.doctor_id,
    date: params.date,
    status: { [Op.in]: ["scheduled", "completed"] },
    start_time: { [Op.lt]: params.end_time },
    end_time: { [Op.gt]: params.start_time },
  };
  if (params.exclude_appointment_id) {
    where.appointment_id = { [Op.ne]: params.exclude_appointment_id };
  }

  return await Appointment.findAll({ where, transaction: t });
};
