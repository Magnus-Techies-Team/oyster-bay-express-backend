import {
  constructCreateQueryStringBasedOnParams,
  constructDeleteQueryStringBasedOnParams,
  constructGetQueryStringBasedOnParams,
  constructUpdateQueryStringBasedOnParams,
} from "./crudHelper";
import DBHelper from "../dataSources/DBHelper";
import { postgresConfig } from "../dataSources/pgConfig";
import {
  createRecordType,
  deleteRecordType,
  readRecordType,
  updateRecordType,
} from "../types/crudTypes";

class ServiceClass {
  async createRecord(data: createRecordType) {
    let { queryString, valuesArray } =
      constructCreateQueryStringBasedOnParams(data);
    return await DBHelper.executePgQuery({
      query: queryString,
      values: valuesArray,
      dbConfig: postgresConfig,
    });
  }

  async getRecord(data: readRecordType) {
    let queryString = constructGetQueryStringBasedOnParams(data);
    return await DBHelper.executePgQuery({
      query: queryString,
      values: [],
      dbConfig: postgresConfig,
    });
  }

  async updateRecord(data: updateRecordType) {
    let { queryString, valuesArray } =
      constructUpdateQueryStringBasedOnParams(data);
    return await DBHelper.executePgQuery({
      query: queryString,
      values: valuesArray,
      dbConfig: postgresConfig,
    });
  }

  async deleteRecord(data: deleteRecordType) {
    let queryString = constructDeleteQueryStringBasedOnParams(data);
    return await DBHelper.executePgQuery({
      query: queryString,
      values: [],
      dbConfig: postgresConfig,
    });
  }
}
