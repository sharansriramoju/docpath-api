import { Umzug, SequelizeStorage } from "umzug";
import { sequelize } from "./models/index";

export const seeder = new Umzug({
  migrations: {
    glob: "src/database/seeders/*.ts",
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize, // separate table from migrations
  }),
  logger: console,
});

export const runSeeders = async () => {
  const pending = await seeder.pending();

  if (pending.length === 0) {
    console.log("✅ No seeders to run");
    return;
  }

  console.log(
    "🌱 Running seeders:",
    pending.map((s) => s.name),
  );
  await seeder.up();
};
