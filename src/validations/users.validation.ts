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
