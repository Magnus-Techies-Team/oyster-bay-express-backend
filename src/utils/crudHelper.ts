import {
  createRecordType,
  deleteRecordType,
  readRecordType,
  updateRecordType,
} from "../types/crudTypes";

export function constructCreateQueryStringBasedOnParams(
  data: createRecordType
): { queryString: string; valuesArray: any } {
  const columnNames: Array<string> = [];
  const columnValues: Array<any> = [];
  Object.keys(data.columnObject).forEach((columnKey: string) => {
    const tempColumnValue: any = data.columnObject[columnKey];
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

export function constructGetQueryStringBasedOnParams(
  data: readRecordType
): string | never {
  let getRecordQueryString = `select * from ${data.tableName}`;
  if (data.searchBy && data.value) {
    const value =
      typeof data.value === "string" ? `'${data.value}'` : data.value;
    getRecordQueryString += ` WHERE ${data.searchBy} = ${value} `;
  } else if ((!data.searchBy && data.value) || (!data.value && data.searchBy)) {
    throw new Error("To make a search, searchBy and value must be defined.");
  }
  return getRecordQueryString;
}

export function constructUpdateQueryStringBasedOnParams(
  data: updateRecordType
): { queryString: string; valuesArray: any } {
  const columnValues: Array<any> = [];
  let updateRecordQueryString = `UPDATE ${data.tableName} SET `;
  let counter = 1;
  Object.keys(data.columnObject).forEach((columnKey: string) => {
    const tempColumnValue: any = data.columnObject[columnKey];
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
  updateRecordQueryString += ` WHERE ${counter} =`;
  columnValues.push(data.searchBy);
  counter += 1;
  updateRecordQueryString += ` $${counter} returning *`;
  columnValues.push(data.value);
  return { queryString: updateRecordQueryString, valuesArray: columnValues };
}

export function constructDeleteQueryStringBasedOnParams(
  data: deleteRecordType
): string {
  return `delete from ${data.tableName} WHERE ${data.searchBy} = '${data.value}' returning *`;
}
