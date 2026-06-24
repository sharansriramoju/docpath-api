import z from "zod";

// The clinic operates in IST; evaluate "past" against that timezone so a
// same-day earlier time is correctly rejected regardless of server timezone.
const IST_OFFSET = "+05:30";
const isAppointmentInFuture = (date: string, start_time: string): boolean => {
  const start = new Date(`${date.slice(0, 10)}T${start_time}:00${IST_OFFSET}`);
  return start.getTime() >= Date.now();
};

export const createAppointmentSchema = z
  .object({
    patient_id: z.uuid(),
    doctor_id: z.uuid(),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
    start_time: z
      .string()
      .refine((time) => /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time), {
        message: "Invalid time format, expected HH:mm",
      }),
    end_time: z
      .string()
      .refine((time) => /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time), {
        message: "Invalid time format, expected HH:mm",
      }),
    location_id: z.uuid(),
    reason: z.string().optional(),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "end_time must be after start_time",
    path: ["end_time"],
  })
  .refine((data) => isAppointmentInFuture(data.date, data.start_time), {
    message: "start_time cannot be in the past",
    path: ["start_time"],
  })
  .refine((data) => isAppointmentInFuture(data.date, data.end_time), {
    message: "end_time cannot be in the past",
    path: ["end_time"],
  });

export const getAppointmentsSchema = z.object({
  doctor_id: z.uuid().optional(),
  location_id: z.uuid(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

export const getAppointmentsOverviewSchema = z
  .object({
    doctor_id: z.uuid().optional(),
    view: z.enum(["week", "month", "all"]),
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "month must be in YYYY-MM format")
      .optional(),
    week_start: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid week_start date",
      })
      .optional(),
    week_end: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid week_end date",
      })
      .optional(),
  })
  .refine((data) => data.view !== "month" || !!data.month, {
    message: "month is required when view is 'month'",
    path: ["month"],
  })
  .refine(
    (data) => data.view !== "week" || (!!data.week_start && !!data.week_end),
    {
      message: "week_start and week_end are required when view is 'week'",
      path: ["week_start"],
    },
  );

export const appointmentIdParamsSchema = z.object({
  appointment_id: z.uuid(),
});

export const rescheduleAppointmentSchema = z
  .object({
    date: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
    start_time: z
      .string()
      .refine((time) => /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time), {
        message: "Invalid time format, expected HH:mm",
      }),
    end_time: z
      .string()
      .refine((time) => /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time), {
        message: "Invalid time format, expected HH:mm",
      }),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "end_time must be after start_time",
    path: ["end_time"],
  })
  .refine((data) => isAppointmentInFuture(data.date, data.start_time), {
    message: "start_time cannot be in the past",
    path: ["start_time"],
  })
  .refine((data) => isAppointmentInFuture(data.date, data.end_time), {
    message: "end_time cannot be in the past",
    path: ["end_time"],
  });

export const updateAppointmentNotesSchema = z
  .object({
    reason: z.string().optional(),
    doctor_notes: z.string().optional(),
    prescription: z.string().optional(),
  })
  .refine(
    (data) =>
      data.reason !== undefined ||
      data.doctor_notes !== undefined ||
      data.prescription !== undefined,
    {
      message:
        "At least one of reason, doctor_notes or prescription must be provided",
      path: ["doctor_notes"],
    },
  );
