import { pgConfig } from "./utils/pgConfig";
import pgPool from "./utils/pgPool";

export default class DBHelper {
  public async executePgQuery(data: {
    query: string;
    values: Array<any>;
    dbConfig: pgConfig;
  }): Promise<any> {
    let connection = await pgPool(data.dbConfig).connect();
    try {
      const result = await connection.query(data.query, data.values);
      return result;
    } catch (error) {
      console.error(error);
      return { error: error };
    } finally {
      if (connection) {
        try {
          connection.release();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}

// export default new DBHelper();
