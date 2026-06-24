import z from "zod";

// role_id is intentionally omitted — it is forced to PATIENT_ROLE_ID by the
// service. Patients have no location_ids / reporting_doctor_ids.
export const createPatientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  gender: z.enum(
    ["male", "female", "other"],
    "Gender must be 'male', 'female', or 'other'",
  ),
  date_of_birth: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .refine((date) => new Date(date) < new Date(), "Must be in the past"),
});

export const updatePatientSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.email("Invalid email address").optional(),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    date_of_birth: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
      .refine((date) => new Date(date) < new Date(), "Must be in the past")
      .optional(),
    profile_image_url: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export const getPatientsSchema = z.object({
  limit: z.string().regex(/^\d+$/, "limit must be a numeric string").optional(),
  page: z.string().regex(/^\d+$/, "page must be a numeric string").optional(),
  // Partial substring name search (min 3 chars) via the trigram blind index.
  name: z.string().optional(),
  // Exact-match search: the full phone or email must be provided.
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional(),
  email: z.email("Invalid email address").optional(),
});

export const patientIdParamsSchema = z.object({
  user_id: z.uuid(),
});
