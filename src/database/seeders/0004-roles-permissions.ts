import crypto from "crypto";
import { QueryInterface } from "sequelize";

// Seed the permissions for managing roles. These are not mapped to any role
// here — map them to a role via the roles API (or manually) to grant access.
const ROLES_PERMISSIONS = [
  {
    permission_id: crypto.randomUUID(),
    action: "create",
    subject: "Roles",
  },
  {
    permission_id: crypto.randomUUID(),
    action: "read",
    subject: "Roles",
  },
  {
    permission_id: crypto.randomUUID(),
    action: "update",
    subject: "Roles",
  },
  {
    permission_id: crypto.randomUUID(),
    action: "delete",
    subject: "Roles",
  },
];

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
}

export async function down({ context }: { context: QueryInterface }) {
  const permission_ids = ROLES_PERMISSIONS.map((p) => p.permission_id);
  await context.bulkDelete("permissions", { permission_id: permission_ids });
}
