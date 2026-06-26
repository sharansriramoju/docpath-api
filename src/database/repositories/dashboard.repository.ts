import { QueryTypes } from "sequelize";
import { sequelize, User } from "../models";
import { PATIENT_ROLE_ID } from "../../config/constants";

export const getTotalPatientsRepository = async () => {
  const count = await User.count({ where: { role_id: PATIENT_ROLE_ID } });
  return count;
};

export const getTodayAppointmentsRepository = async () => {
  const [result] = await sequelize.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count
       FROM appointments
      WHERE date = (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata')::date`,
    { type: QueryTypes.SELECT },
  );
  return result.count;
};

export const getAppointmentTrendsRepository = async (filters: {
  start_date: string;
  end_date: string;
  granularity: "day" | "week" | "month";
}) => {
  const trunc =
    filters.granularity === "day"
      ? "day"
      : filters.granularity === "week"
        ? "week"
        : "month";

  return await sequelize.query<{ period: string; count: number }>(
    `SELECT date_trunc(:trunc, date::timestamp)::date::text AS period,
            COUNT(*)::int AS count
       FROM appointments
      WHERE date BETWEEN :start_date AND :end_date
      GROUP BY period
      ORDER BY period ASC`,
    {
      replacements: {
        trunc,
        start_date: filters.start_date,
        end_date: filters.end_date,
      },
      type: QueryTypes.SELECT,
    },
  );
};

export const getPatientVolumeByLocationRepository = async (filters: {
  start_date?: string;
  end_date?: string;
}) => {
  const conditions: string[] = [];
  const replacements: Record<string, unknown> = {};

  if (filters.start_date && filters.end_date) {
    conditions.push("a.date BETWEEN :start_date AND :end_date");
    replacements.start_date = filters.start_date;
    replacements.end_date = filters.end_date;
  }

  const where_clause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  return await sequelize.query<{
    location_id: string;
    location_name: string;
    count: number;
  }>(
    `SELECT a.location_id,
            l.name AS location_name,
            COUNT(DISTINCT a.patient_id)::int AS count
       FROM appointments a
       JOIN locations l ON l.location_id = a.location_id
       ${where_clause}
      GROUP BY a.location_id, l.name
      ORDER BY count DESC`,
    { replacements, type: QueryTypes.SELECT },
  );
};

export const getNewPatientRegistrationsRepository = async (filters: {
  start_date: string;
  end_date: string;
  granularity: "day" | "week";
}) => {
  const trunc = filters.granularity === "day" ? "day" : "week";

  return await sequelize.query<{ period: string; count: number }>(
    `SELECT date_trunc(:trunc, created_at)::date::text AS period,
            COUNT(*)::int AS count
       FROM users
      WHERE role_id = :patient_role_id
        AND created_at::date BETWEEN :start_date AND :end_date
      GROUP BY period
      ORDER BY period ASC`,
    {
      replacements: {
        trunc,
        patient_role_id: PATIENT_ROLE_ID,
        start_date: filters.start_date,
        end_date: filters.end_date,
      },
      type: QueryTypes.SELECT,
    },
  );
};

export const getPeakAppointmentHoursRepository = async (filters: {
  start_date?: string;
  end_date?: string;
}) => {
  const conditions: string[] = [];
  const replacements: Record<string, unknown> = {};

  if (filters.start_date && filters.end_date) {
    conditions.push("date BETWEEN :start_date AND :end_date");
    replacements.start_date = filters.start_date;
    replacements.end_date = filters.end_date;
  }

  const where_clause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  return await sequelize.query<{ hour: number; count: number }>(
    `SELECT EXTRACT(HOUR FROM start_time::time)::int AS hour,
            COUNT(*)::int AS count
       FROM appointments
       ${where_clause}
      GROUP BY hour
      ORDER BY hour ASC`,
    { replacements, type: QueryTypes.SELECT },
  );
};
