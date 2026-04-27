import z from "zod";

export const addDoctorRoutineValidation = z
  .object({
    doctor_id: z.uuid(),
    index: z.number().int().nonnegative().optional(),
    day_of_week: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
    end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
    location_id: z.uuid(),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "start_time must be less than end_time",
    path: ["end_time"],
  });
