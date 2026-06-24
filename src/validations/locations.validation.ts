import z from "zod";

export const locationIdParamsSchema = z.object({
  location_id: z.uuid("location_id must be a valid UUID"),
});

export const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  google_maps_url: z.string().min(1, "Google Maps URL is required"),
});

export const getLocationsSchema = z.object({
  search: z.string().optional(),
  limit: z.string().regex(/^\d+$/, "Limit must be a numeric string").optional(),
  page: z.string().regex(/^\d+$/, "Page must be a numeric string").optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const updateLocationSchema = z.object({
  location_id: z.uuid("Location ID must be a valid UUID"),
  name: z.string().min(1, "Name is required").optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  google_maps_url: z.string().min(1, "Google Maps URL is required").optional(),
});
