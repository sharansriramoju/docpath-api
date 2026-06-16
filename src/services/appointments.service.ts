import { ForbiddenError, subject } from "@casl/ability";
import {
  createAppointmentRepository,
  getAppointmentStatusCountsByLocationRepository,
  getAppointmentsRepository,
  getExistingScheduledAppointmentsAtDateTimeRepository,
} from "../database/repositories/appointments.repository";
import { getUserWithRoleByIdRepository } from "../database/repositories/users.repository";
import { ApiError } from "../errors/ApiError";
import { sequelize } from "../database/models";
import { decryptPII } from "../helpers/index.helper";

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
      appointment_data.doctor_id,
      appointment_data.date,
      appointment_data.start_time,
      appointment_data.end_time,
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

  // When no doctor_id is supplied, show the logged-in doctor's own overview.
  const doctor_id = query.doctor_id ?? current_user_id;

  // Derive the caller's permitted doctors and locations from their ability
  // rules so the aggregate can only ever count appointments they may read.
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

  // The caller may only request overviews for doctors they are allowed to read.
  if (!unrestricted_doctors && !allowed_doctor_ids.has(doctor_id)) {
    throw new ApiError(
      403,
      "You are not allowed to view this doctor's appointments",
    );
  }

  // Restrict the aggregate to the caller's permitted locations. If they have
  // no permitted locations, there is nothing they are allowed to see.
  let location_ids: string[] | undefined;
  if (!unrestricted_locations) {
    if (allowed_location_ids.size === 0) {
      return [];
    }
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

  return await getAppointmentStatusCountsByLocationRepository({
    doctor_id,
    start_date,
    end_date,
    location_ids,
  });
};
