import z from "zod";

const date_string = z.string().date();

export const appointmentTrendsQuerySchema = z.object({
  start_date: date_string,
  end_date: date_string,
  granularity: z.enum(["day", "week", "month"]).default("day"),
});

export const dateRangeOptionalQuerySchema = z.object({
  start_date: date_string.optional(),
  end_date: date_string.optional(),
}).refine(
  (data) => {
    if (data.start_date && !data.end_date) return false;
    if (!data.start_date && data.end_date) return false;
    return true;
  },
  { message: "Both start_date and end_date must be provided together" },
);

export const newPatientRegistrationsQuerySchema = z.object({
  start_date: date_string,
  end_date: date_string,
  granularity: z.enum(["day", "week"]).default("day"),
});
