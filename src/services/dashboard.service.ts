import {
  getAppointmentTrendsRepository,
  getNewPatientRegistrationsRepository,
  getPatientVolumeByLocationRepository,
  getPeakAppointmentHoursRepository,
  getTodayAppointmentsRepository,
  getTotalPatientsRepository,
} from "../database/repositories/dashboard.repository";

export const getTotalPatientsService = async () => {
  const count = await getTotalPatientsRepository();
  return { total_patients: count };
};

export const getTodayAppointmentsService = async () => {
  const count = await getTodayAppointmentsRepository();
  return { today_appointments: count };
};

export const getAppointmentTrendsService = async (query: {
  start_date: string;
  end_date: string;
  granularity: "day" | "week" | "month";
}) => {
  const trends = await getAppointmentTrendsRepository(query);
  return { rows: trends, count: trends.length };
};

export const getPatientVolumeByLocationService = async (query: {
  start_date?: string;
  end_date?: string;
}) => {
  const volumes = await getPatientVolumeByLocationRepository(query);
  return { rows: volumes, count: volumes.length };
};

export const getNewPatientRegistrationsService = async (query: {
  start_date: string;
  end_date: string;
  granularity: "day" | "week";
}) => {
  const registrations = await getNewPatientRegistrationsRepository(query);
  return { rows: registrations, count: registrations.length };
};

export const getPeakAppointmentHoursService = async (query: {
  start_date?: string;
  end_date?: string;
}) => {
  const peaks = await getPeakAppointmentHoursRepository(query);
  return { rows: peaks, count: peaks.length };
};
