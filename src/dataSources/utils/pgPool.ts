import { Pool } from "pg";
import { pgConfig } from "./pgConfig";

const pgPool = (config: pgConfig) =>
  new Pool({
    user: config.user,
    host: config.host,
    database: config.name,
    password: config.pass!,
    port: config.port,
  });
export default pgPool;
