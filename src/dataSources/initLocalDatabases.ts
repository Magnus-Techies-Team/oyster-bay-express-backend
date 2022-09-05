import { dbHelper } from "~/projectDependencies";
import {
  installExtension,
  createUsersTable,
  createQuizTable,
  createQuestionType,
  createQuestionsTable,
} from "./dbQueries";

export async function initLocalDatabasesIfNotExists(): Promise<any> {
  const queryToExecute = `
    ${installExtension}
    ${createUsersTable}
    ${createQuizTable}
    ${createQuestionType}
    ${createQuestionsTable}
  `;
  const resultFromInit = await dbHelper.executePgQuery({
    query: queryToExecute,
    values: [],
  });
  if (resultFromInit.error) {
    throw new Error(
      `Failed to initialize database. Error: ${resultFromInit.error}`
    );
  }
}
