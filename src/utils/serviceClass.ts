import {
  constructCreateQueryStringBasedOnParams,
  constructDeleteQueryStringBasedOnParams,
  constructGetQueryStringBasedOnParams,
  constructUpdateQueryStringBasedOnParams,
} from "./crudHelper";
import DBHelper from "../dataSources/DBHelper";
import {
  createRecordType,
  deleteRecordType,
  readRecordType,
  updateRecordType,
} from "../types/crudTypes";

export default new (class ServiceClass {
  async createRecord(data: createRecordType) {
    const { queryString, valuesArray } =
      constructCreateQueryStringBasedOnParams(data);
    return await DBHelper.executePgQuery({
      query: queryString,
      values: valuesArray,
    });
  }

  async getRecord(data: readRecordType) {
    const queryString = constructGetQueryStringBasedOnParams(data);
    return await DBHelper.executePgQuery({
      query: queryString,
      values: [],
    });
  }

  async updateRecord(data: updateRecordType) {
    const { queryString, valuesArray } =
      constructUpdateQueryStringBasedOnParams(data);
    return await DBHelper.executePgQuery({
      query: queryString,
      values: valuesArray,
    });
  }

  async deleteRecord(data: deleteRecordType) {
    const queryString = constructDeleteQueryStringBasedOnParams(data);
    return await DBHelper.executePgQuery({
      query: queryString,
      values: [],
    });
  }
})();
