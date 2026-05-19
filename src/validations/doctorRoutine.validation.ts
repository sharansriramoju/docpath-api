import z from "zod";

export const addDoctorRoutineValidation = z
  .object({
    doctor_id: z.uuid(),
    index: z.number().int().min(1).max(6).optional(),
    day_of_week: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
    end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
    location_id: z.uuid(),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "start_time must be less than end_time",
    path: ["end_time"],
  });

export const getDoctorRoutineValidation = z.object({
  doctor_id: z.uuid().optional(),
  index: z
    .string()
    .regex(/^[1-6]$/, "day_of_week should between 1 and 6")
    .optional(),
  day_of_week: z
    .string()
    .regex(/^[0-6]$/, "day_of_week should between 0 and 6 ")
    .optional(),
  location_ids: z
    .string()
    .regex(
      /^\[(\s*"([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})"\s*(,\s*"([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})"\s*)*)?\]$/,
      "Invalid location ids",
    )
    .optional(),
});

export const updateDoctorRoutineValidation = z
  .object({
    index: z.number().int().min(1).max(6).optional(),
    day_of_week: z.number().int().min(0).max(6).optional(),
    start_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .optional(),
    end_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .optional(),
    is_active: z.boolean().optional(),
    location_id: z.uuid().optional(),
  })
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return true; // skip if either is absent
      return data.start_time < data.end_time;
    },
    {
      message: "start_time must be less than end_time",
      path: ["end_time"],
    },
  );
