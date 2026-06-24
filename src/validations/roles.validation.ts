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

// Edit an existing mapping: change its scope, conditions, and/or the mapped
// permission (new_permission_id). permission_id identifies the current row.
const editPermissionSchema = z
  .object({
    permission_id: z.uuid(),
    new_permission_id: z.uuid().optional(),
    scope: z.enum(["ALL", "LIMITED"]).optional(),
    conditions: z.record(z.string(), z.any()).nullable().optional(),
  })
  .refine(
    (data) =>
      data.new_permission_id !== undefined ||
      data.scope !== undefined ||
      data.conditions !== undefined,
    {
      message:
        "Each edit must change the scope, conditions, or the permission itself",
    },
  );

export const updateRoleSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
    // Permissions to add/upsert onto the role.
    add_permissions: z.array(rolePermissionSchema).optional(),
    // Existing mappings to edit (change scope/conditions/permission).
    edit_permissions: z.array(editPermissionSchema).optional(),
    // permission_ids to unmap from the role.
    remove_permissions: z.array(z.uuid()).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.add_permissions !== undefined ||
      data.edit_permissions !== undefined ||
      data.remove_permissions !== undefined,
    { message: "At least one field must be provided to update" },
  );

export const roleIdParamsSchema = z.object({
  role_id: z.string().regex(/^\d+$/, "role_id must be a positive integer"),
});

export const getPermissionsSchema = z.object({
  search: z.string().optional(),
});

export const getRolesSchema = z.object({
  search: z.string().optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a numeric string").optional(),
  page: z.string().regex(/^\d+$/, "page must be a numeric string").optional(),
});
