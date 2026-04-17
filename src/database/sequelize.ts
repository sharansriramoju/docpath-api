// src/database/dbconfig.ts
import "dotenv/config";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.HA_DB_NAME!,
  process.env.HA_DB_USER!,
  process.env.HA_DB_PASS!,
  {
    host: process.env.HA_DB_HOST!,
    port: parseInt(process.env.HA_DB_PORT!, 10),
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true, // <--- enables SSL
        rejectUnauthorized: false, // <--- for self-signed certificates
      },
    },
    logging: false, // set to console.log to see SQL queries
    timezone: "+05:30", // set to your timezone
  },
);

export default sequelize;
