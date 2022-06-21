import {
  createRecordType,
  deleteRecordType,
  readRecordType,
  updateRecordType,
} from "../types/crudTypes";

export function constructCreateQueryStringBasedOnParams(
  data: createRecordType
): { queryString: string; valuesArray: any } {
  let columnNames: Array<string> = [];
  let columnValues: Array<any> = [];
  Object.keys(data.columnObject).forEach((columnKey: string) => {
    let tempColumnValue: any = data.columnObject[columnKey];
    if (tempColumnValue != undefined) {
      columnNames.push(columnKey);
      columnValues.push(tempColumnValue);
    }
  });
  const createRecordQueryString = `INSERT INTO ${
    data.tableName
  } (${columnNames.join(", ")}) VALUES (${columnNames.map(
    (elem: any) => `$${columnNames.indexOf(elem) + 1}`
  )}) returning *`;
  return { queryString: createRecordQueryString, valuesArray: columnValues };
}

export function constructGetQueryStringBasedOnParams(data: readRecordType) {
  let getRecordQueryString = `select * from ${data.tableName}`;
  if (data.searchBy && data.value) {
    getRecordQueryString += ` WHERE ${data.searchBy} = ${typeof data.value === "string" ? `'${data.value}'` : data.value} `;
  } else if ((!data.searchBy && data.value) || (!data.value && data.searchBy)) {
    throw new Error("To make a search, searchBy and value must be defined.");
  }
  return getRecordQueryString;
}

export function constructUpdateQueryStringBasedOnParams(
  data: updateRecordType
): { queryString: string; valuesArray: any } {
  let columnValues: Array<any> = [];
  let updateRecordQueryString = `UPDATE ${data.tableName} SET `;
  let counter = 1;
  Object.keys(data.columnObject).forEach((columnKey: string) => {
    let tempColumnValue: any = data.columnObject[columnKey];
    if (tempColumnValue !== undefined) {
      updateRecordQueryString += `${columnKey} = $${counter}, `;
      columnValues.push(tempColumnValue);
      counter += 1;
    }
  });
  updateRecordQueryString = updateRecordQueryString.substring(
    0,
    updateRecordQueryString.length - 2
  );
  updateRecordQueryString += ` WHERE ${data.searchBy} = $${counter} returning *`;
  columnValues.push(data.searchBy);
  return { queryString: updateRecordQueryString, valuesArray: columnValues };
}

export function constructDeleteQueryStringBasedOnParams(
  data: deleteRecordType
) {
  return `delete from ${data.tableName} WHERE ${data.searchBy} = ${data.value} returning *`;
}
