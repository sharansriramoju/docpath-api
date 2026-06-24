import z from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  gender: z.enum(
    ["male", "female", "other"],
    "Gender must be 'male', 'female', or 'other'",
  ),
  date_of_birth: z
    .string()
    .refine((date) => {
      const parsed_date = Date.parse(date);
      return !isNaN(parsed_date);
    }, "Invalid date format for date_of_birth")
    .refine((date) => {
      return new Date(date) < new Date();
    }, "date_of_birth must be in the past"),
  reporting_doctor_ids: z.array(z.uuid()).optional(),
  location_ids: z.array(z.uuid()).optional(),
  role_id: z.number().optional(),
});

export const userIdParamsSchema = z.object({
  user_id: z.uuid(),
});

export const getUsersSchema = z.object({
  limit: z.string().regex(/^\d+$/, "limit must be a numeric string").optional(),
  page: z.string().regex(/^\d+$/, "page must be a numeric string").optional(),
  role_id: z
    .string()
    .regex(/^\d+$/, "role_id must be a numeric string")
    .optional(),
  role_name: z.string().optional(),
  // Partial substring name search (min 3 chars) via the trigram blind index.
  name: z.string().optional(),
  // Exact-match search: the full phone or email must be provided.
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional(),
  email: z.email("Invalid email address").optional(),
});

export const updateUserSchema = z
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
    role_id: z.number().optional(),
    add_location_ids: z.array(z.uuid()).optional(),
    remove_location_ids: z.array(z.uuid()).optional(),
    add_reporting_doctor_ids: z.array(z.uuid()).optional(),
    remove_reporting_doctor_ids: z.array(z.uuid()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });
