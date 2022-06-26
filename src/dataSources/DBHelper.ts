import { PoolClient } from "pg";
import { pgConfig } from "./utils/pgConfig";
import pgPool from "./utils/pgPool";

class DBHelper {
  private connection: PoolClient;
  public async init(dbConfig: pgConfig) {
    this.connection = await pgPool(dbConfig).connect();
  }

  public async executePgQuery(data: {
    query: string;
    values: Array<any>;
  }): Promise<any> {
    try {
      const result = await this.connection.query(data.query, data.values);
      return result;
    } catch (error) {
      console.error(error);
      return { error: error };
    } 
  }
}

export default new DBHelper();
