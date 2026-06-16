import z from "zod";

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
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "end_time must be after start_time",
    path: ["end_time"],
  });

export const getAppointmentsSchema = z.object({
  doctor_id: z.uuid(),
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
