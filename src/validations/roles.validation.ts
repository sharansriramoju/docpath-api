import z from "zod";

// A single permission mapping attached to a role. `scope` + `conditions`
// mirror the role_permissions join and are what defineAbility consumes.
const rolePermissionSchema = z.object({
  permission_id: z.uuid(),
  scope: z.enum(["ALL", "LIMITED"]).optional(),
  conditions: z.record(z.string(), z.any()).optional(),
});

export const createRoleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  permissions: z.array(rolePermissionSchema).optional(),
});

export const updateRoleSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
    permissions: z.array(rolePermissionSchema).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.permissions !== undefined,
    { message: "At least one field must be provided to update" },
  );

export const roleIdParamsSchema = z.object({
  role_id: z.string().regex(/^\d+$/, "role_id must be a positive integer"),
});
