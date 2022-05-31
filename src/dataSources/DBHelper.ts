import { pgConfig } from "./utils/pgConfig";
import pgPool from "./utils/pgPool";

class DBHelper {
  public async executePgQuery(
    query: string,
    values: Array<any>,
    dbConfig: pgConfig,
  ): Promise<any> {
    let connection = await pgPool(dbConfig).connect();
    try {
      const result = await connection.query(query, values);
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

export default new DBHelper();
