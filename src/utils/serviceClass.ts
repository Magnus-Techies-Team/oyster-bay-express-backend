import {
  constructCreateQueryStringBasedOnParams,
  constructDeleteQueryStringBasedOnParams,
  constructGetQueryStringBasedOnParams,
  constructUpdateQueryStringBasedOnParams,
} from "~/utils/crudHelper";
import { dbHelper } from "~/projectDependencies";
import {
  createRecordType,
  deleteRecordType,
  readRecordType,
  updateRecordType,
} from "~/types/crudTypes";

export default class ServiceClass {
  async createRecord(data: createRecordType): Promise<any> {
    const { queryString, valuesArray } =
      constructCreateQueryStringBasedOnParams(data);
    return await dbHelper.executePgQuery({
      query: queryString,
      values: valuesArray,
    });
  }

  async getRecord(data: readRecordType): Promise<any> {
    const queryString = constructGetQueryStringBasedOnParams(data);
    return await dbHelper.executePgQuery({
      query: queryString,
      values: [],
    });
  }

  async updateRecord(data: updateRecordType): Promise<any> {
    const { queryString, valuesArray } =
      constructUpdateQueryStringBasedOnParams(data);
    return await dbHelper.executePgQuery({
      query: queryString,
      values: valuesArray,
    });
  }

  async deleteRecord(data: deleteRecordType): Promise<any> {
    const queryString = constructDeleteQueryStringBasedOnParams(data);
    return await dbHelper.executePgQuery({
      query: queryString,
      values: [],
    });
  }
}
