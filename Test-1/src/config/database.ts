/**
 * Sequelize database configuration.
 * Initializes the Sequelize instance for connecting to the Postgres database.
 */
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Create a new Sequelize instance using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME || "",
  process.env.DB_USER || "",
  process.env.PASS || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false, // Disable SQL query logging
  }
);

export default sequelize;
