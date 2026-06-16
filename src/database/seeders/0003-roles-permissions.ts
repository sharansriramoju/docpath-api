import { QueryInterface } from "sequelize";

// Bootstrap permissions for managing roles themselves, mapped to the admin
// role so the roles/permissions CRUD APIs are usable out of the box. Fixed
// UUIDs keep the mapping deterministic and idempotent.
const ROLES_PERMISSIONS = [
  {
    permission_id: "11111111-1111-4111-8111-111111111111",
    action: "create",
    subject: "Roles",
  },
  {
    permission_id: "22222222-2222-4222-8222-222222222222",
    action: "read",
    subject: "Roles",
  },
  {
    permission_id: "33333333-3333-4333-8333-333333333333",
    action: "update",
    subject: "Roles",
  },
  {
    permission_id: "44444444-4444-4444-8444-444444444444",
    action: "delete",
    subject: "Roles",
  },
];

// role_id 1 is the "Doctor" role, seeded as the administrator with full
// permissions in 0001-roles.
const ADMIN_ROLE_ID = 1;

export async function up({ context }: { context: QueryInterface }) {
  await context.bulkInsert(
    "permissions",
    ROLES_PERMISSIONS.map((permission) => ({
      permission_id: permission.permission_id,
      action: permission.action,
      subject: permission.subject,
      created_at: new Date(),
    })),
  );

  // scope "ALL" is required: defineAbility only grants LIMITED scope for the
  // DoctorRoutine/Locations/Appointments subjects, so a LIMITED "Roles"
  // mapping would grant nothing.
  await context.bulkInsert(
    "role_permissions",
    ROLES_PERMISSIONS.map((permission) => ({
      role_id: ADMIN_ROLE_ID,
      permission_id: permission.permission_id,
      scope: "ALL",
      conditions: null,
    })),
  );
}

export async function down({ context }: { context: QueryInterface }) {
  const permission_ids = ROLES_PERMISSIONS.map((p) => p.permission_id);
  await context.bulkDelete("role_permissions", {
    permission_id: permission_ids,
  });
  await context.bulkDelete("permissions", { permission_id: permission_ids });
}
