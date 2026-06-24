import { ForbiddenError, subject } from "@casl/ability";
import {
  createAppointmentRepository,
  getAppointmentByIdRepository,
  getAppointmentOverviewCountsRepository,
  getAppointmentsRepository,
  getExistingScheduledAppointmentsAtDateTimeRepository,
  updateAppointmentRepository,
} from "../database/repositories/appointments.repository";
import { getUserWithRoleByIdRepository } from "../database/repositories/users.repository";
import { ApiError } from "../errors/ApiError";
import { sequelize } from "../database/models";
import { decryptPII } from "../helpers/index.helper";

// Inclusive list of "YYYY-MM-DD" date strings between start and end.
const enumerateDates = (start: string, end: string): string[] => {
  const dates: string[] = [];
  const current = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
};

// Decrypt the PII fields on an included patient record so the dashboard can
// display readable values (User PII is stored encrypted at rest).
const decryptPatient = (patient: any) => {
  if (!patient) return patient;
  return {
    ...patient,
    name: patient.name ? decryptPII(patient.name) : patient.name,
    phone: patient.phone ? decryptPII(patient.phone) : patient.phone,
    email: patient.email ? decryptPII(patient.email) : patient.email,
    gender: patient.gender ? decryptPII(patient.gender) : patient.gender,
    date_of_birth: patient.date_of_birth
      ? decryptPII(patient.date_of_birth)
      : patient.date_of_birth,
    profile_image_url: patient.profile_image_url
      ? decryptPII(patient.profile_image_url)
      : patient.profile_image_url,
  };
};

export const createAppointmentService = async (
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
  user_ability: any,
) => {
  ForbiddenError.from(user_ability).throwUnlessCan(
    "create",
    subject("Appointments", {
      location_id: appointment_data.location_id,
      doctor_id: appointment_data.doctor_id,
    }),
  );

  const doctor = await getUserWithRoleByIdRepository(appointment_data.doctor_id);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }
  const role_name = (doctor as any).role?.name;
  if (!role_name || !role_name.toLowerCase().includes("doctor")) {
    throw new ApiError(
      400,
      "Appointments can only be created for users with a doctor role",
    );
  }

  // Check for conflicts and create inside a single transaction so two
  // concurrent requests cannot both pass the conflict check and double-book.
  return await sequelize.transaction(async (t) => {
    const conflicts = await getExistingScheduledAppointmentsAtDateTimeRepository(
      {
        doctor_id: appointment_data.doctor_id,
        date: appointment_data.date,
        start_time: appointment_data.start_time,
        end_time: appointment_data.end_time,
      },
      t,
    );
    if (conflicts.length > 0) {
      throw new ApiError(
        409,
        "The doctor already has an appointment in this time slot",
      );
    }

    return await createAppointmentRepository(appointment_data, t);
  });
};

export const getAppointmentsService = async (
  query: {
    doctor_id?: string;
    location_id: string;
    date?: string;
  },
  current_user_id: string,
  user_ability: any,
) => {
  // When no doctor_id is supplied, list the logged-in doctor's own appointments.
  const doctor_id = query.doctor_id ?? current_user_id;

  ForbiddenError.from(user_ability).throwUnlessCan(
    "read",
    subject("Appointments", {
      location_id: query.location_id,
      doctor_id,
    }),
  );

  const appointments = await getAppointmentsRepository({
    doctor_id,
    location_id: query.location_id,
    date: query.date,
  });

  return appointments.map((appointment) => {
    const plain = appointment.toJSON() as any;
    return { ...plain, patient: decryptPatient(plain.patient) };
  });
};

export const getAppointmentsOverviewService = async (
  query: {
    doctor_id?: string;
    view: "week" | "month" | "all";
    month?: string;
    week_start?: string;
    week_end?: string;
  },
  current_user_id: string,
  user_ability: any,
) => {
  ForbiddenError.from(user_ability).throwUnlessCan("read", "Appointments");

  // Derive the caller's permitted doctors and locations from their ability
  // rules so the breakdown can only ever count appointments they may read.
  // A rule that does not constrain a field grants unrestricted access to it.
  const rules = user_ability.rulesFor("read", "Appointments");
  let unrestricted_doctors = false;
  let unrestricted_locations = false;
  const allowed_doctor_ids = new Set<string>();
  const allowed_location_ids = new Set<string>();

  for (const rule of rules) {
    if (rule.inverted) continue; // ignore "cannot" rules
    const conditions = rule.conditions as any;
    if (!conditions || conditions.doctor_id === undefined) {
      unrestricted_doctors = true;
    } else if (Array.isArray(conditions.doctor_id?.$in)) {
      conditions.doctor_id.$in.forEach((id: string) =>
        allowed_doctor_ids.add(id),
      );
    }
    if (!conditions || conditions.location_id === undefined) {
      unrestricted_locations = true;
    } else if (Array.isArray(conditions.location_id?.$in)) {
      conditions.location_id.$in.forEach((id: string) =>
        allowed_location_ids.add(id),
      );
    }
  }

  // The overview is for a single doctor: the one passed in the query, or the
  // logged-in user when not supplied. The caller must be permitted to read it.
  const doctor_id = query.doctor_id ?? current_user_id;
  if (!unrestricted_doctors && !allowed_doctor_ids.has(doctor_id)) {
    throw new ApiError(
      403,
      "You are not allowed to view this doctor's appointments",
    );
  }
  const doctor_ids = [doctor_id];

  // Restrict to the caller's permitted locations.
  let location_ids: string[] | undefined;
  if (!unrestricted_locations) {
    if (allowed_location_ids.size === 0) return [];
    location_ids = [...allowed_location_ids];
  }

  let start_date: string | undefined;
  let end_date: string | undefined;

  if (query.view === "month") {
    const [year, month] = query.month!.split("-").map(Number);
    // Day 0 of the next month resolves to the last day of the requested month.
    const last_day = new Date(year, month, 0).getDate();
    start_date = `${query.month}-01`;
    end_date = `${query.month}-${String(last_day).padStart(2, "0")}`;
  } else if (query.view === "week") {
    start_date = query.week_start;
    end_date = query.week_end;
  }
  // view === "all" → no date range, count across all dates.

  const rows = await getAppointmentOverviewCountsRepository({
    start_date,
    end_date,
    doctor_ids,
    location_ids,
  });

  // Group the flat per-(date, location) rows under each date. Rows arrive
  // ordered by date, so Map insertion order keeps the dates ascending.
  // doctor_name comes back encrypted, so decrypt it here.
  const totals_by_date = new Map<string, any[]>();
  for (const row of rows) {
    if (!totals_by_date.has(row.date)) {
      totals_by_date.set(row.date, []);
    }
    totals_by_date.get(row.date)!.push({
      location_id: row.location_id,
      location_name: row.location_name,
      doctor_id: row.doctor_id,
      doctor_name: row.doctor_name
        ? decryptPII(row.doctor_name)
        : row.doctor_name,
      pending: row.pending,
      completed: row.completed,
      cancelled: row.cancelled,
      total_scheduled: row.total_scheduled,
    });
  }

  // For week/month, include every day in the range with an empty totals array
  // when there are no appointments. (view "all" has no range to fill.)
  if (start_date && end_date) {
    return enumerateDates(start_date, end_date).map((date) => ({
      date,
      totals: totals_by_date.get(date) ?? [],
    }));
  }

  return [...totals_by_date.entries()].map(([date, totals]) => ({
    date,
    totals,
  }));
};

export const updateAppointmentNotesService = async (
  appointment_id: string,
  data: { reason?: string; doctor_notes?: string; prescription?: string },
  user_ability: any,
) => {
  const appointment = await getAppointmentByIdRepository(appointment_id);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  ForbiddenError.from(user_ability).throwUnlessCan(
    "update",
    subject("Appointments", {
      location_id: appointment.location_id,
      doctor_id: appointment.doctor_id,
    }),
  );

  return await updateAppointmentRepository(appointment_id, data);
};

export const getAppointmentNotesService = async (
  appointment_id: string,
  user_ability: any,
) => {
  const appointment = await getAppointmentByIdRepository(appointment_id);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  ForbiddenError.from(user_ability).throwUnlessCan(
    "read",
    subject("Appointments", {
      location_id: appointment.location_id,
      doctor_id: appointment.doctor_id,
    }),
  );

  return {
    appointment_id: appointment.appointment_id,
    reason: appointment.reason ?? null,
    doctor_notes: appointment.doctor_notes ?? null,
    prescription: appointment.prescription ?? null,
  };
};

export const rescheduleAppointmentService = async (
  appointment_id: string,
  data: { date: string; start_time: string; end_time: string },
  user_ability: any,
) => {
  const appointment = await getAppointmentByIdRepository(appointment_id);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  // Only the appointment's doctor or a user reporting to that doctor may
  // reschedule it (enforced by the doctor_id condition on the ability rule).
  ForbiddenError.from(user_ability).throwUnlessCan(
    "update",
    subject("Appointments", {
      location_id: appointment.location_id,
      doctor_id: appointment.doctor_id,
    }),
  );

  if (appointment.status !== "scheduled") {
    throw new ApiError(400, "Only scheduled appointments can be rescheduled");
  }

  // Re-check for conflicts in a transaction, ignoring this appointment itself.
  return await sequelize.transaction(async (t) => {
    const conflicts = await getExistingScheduledAppointmentsAtDateTimeRepository(
      {
        doctor_id: appointment.doctor_id,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        exclude_appointment_id: appointment_id,
      },
      t,
    );
    if (conflicts.length > 0) {
      throw new ApiError(
        409,
        "The doctor already has an appointment in this time slot",
      );
    }

    return await updateAppointmentRepository(appointment_id, data, t);
  });
};

export const cancelAppointmentService = async (
  appointment_id: string,
  user_ability: any,
) => {
  const appointment = await getAppointmentByIdRepository(appointment_id);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  ForbiddenError.from(user_ability).throwUnlessCan(
    "update",
    subject("Appointments", {
      location_id: appointment.location_id,
      doctor_id: appointment.doctor_id,
    }),
  );

  if (appointment.status === "cancelled") {
    throw new ApiError(400, "Appointment is already cancelled");
  }
  if (appointment.status === "completed") {
    throw new ApiError(400, "A completed appointment cannot be cancelled");
  }

  return await updateAppointmentRepository(appointment_id, {
    status: "cancelled",
  });
};
