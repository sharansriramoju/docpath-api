import { QueryInterface } from "sequelize";

export async function up({ context }: { context: QueryInterface }) {
  await context.bulkInsert("roles", [
    {
      role_id: 1,
      name: "Doctor",
      description: "Administrator role with full permissions",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      role_id: 2,
      name: "Compounder",
      description: "Assists doctors and manages medical supplies",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      role_id: 3,
      name: "Patient",
      description: "Receives medical care and services",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
  await context.sequelize.query(
    `SELECT setval('roles_role_id_seq', (SELECT MAX(role_id) FROM roles))`,
  );
}

export async function down({ context }: { context: QueryInterface }) {
  await context.bulkDelete("roles", {
    role_id: [1, 2, 3],
  });
}
