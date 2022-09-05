export type createRecordType = {
  tableName: string;
  columnObject: { [columnKey: string]: any };
};

export type readRecordType = {
  tableName: string;
  searchBy?: string;
  value?: number | string;
};

export type updateRecordType = {
  tableName: string;
  columnObject: { [columnKey: string]: any };
  searchBy: string;
  value: string | number;
};

export type deleteRecordType = {
  tableName: string;
  searchBy: string;
  value: number;
};
