import { pgConfig } from "./utils/pgConfig";

export const postgresConfig: pgConfig = {
  user: <string>process.env.DB_USER,
  host: <string>process.env.DB_HOST,
  port: parseInt(<string>process.env.DB_PORT, 10),
  pass: <string>process.env.DB_PASS,
  name: <string>process.env.DB_NAME,
};