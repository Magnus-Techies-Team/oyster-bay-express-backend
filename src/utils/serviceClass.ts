import {
  constructCreateQueryStringBasedOnParams,
  constructDeleteQueryStringBasedOnParams,
  constructGetQueryStringBasedOnParams,
  constructUpdateQueryStringBasedOnParams,
} from "./crudHelper";
import { dbHelper } from "../projectDependencies";
import {
  createRecordType,
  deleteRecordType,
  readRecordType,
  updateRecordType,
} from "../types/crudTypes";

export default class ServiceClass {
  async createRecord(data: createRecordType) {
    const { queryString, valuesArray } =
      constructCreateQueryStringBasedOnParams(data);
    return await dbHelper.executePgQuery({
      query: queryString,
      values: valuesArray,
    });
  }

  async getRecord(data: readRecordType) {
    let queryString = constructGetQueryStringBasedOnParams(data);
    return await dbHelper.executePgQuery({
      query: queryString,
      values: [],
    });
  }

  async updateRecord(data: updateRecordType) {
    const { queryString, valuesArray } =
      constructUpdateQueryStringBasedOnParams(data);
    return await dbHelper.executePgQuery({
      query: queryString,
      values: valuesArray,
    });
  }

  async deleteRecord(data: deleteRecordType) {
    let queryString = constructDeleteQueryStringBasedOnParams(data);
    return await dbHelper.executePgQuery({
      query: queryString,
      values: [],
    });
  }
}
