import { dbHelper } from "../projectDependencies";
import {
  installExtension,
  createUsers,
  createGoogleAuth,
  createGithubAuth,
  createDiscordAuth,
  createQuiz,
  createQuestionType,
  createQuestions,
} from "./dbQueries";
import { postgresConfig } from "./pgConfig";

export async function initLocalDatabasesIfNotExists(): Promise<any> {
  const queryToExecute = `
    ${installExtension}
    ${createUsers}
    ${createGoogleAuth}
    ${createGithubAuth}
    ${createDiscordAuth}
    ${createQuiz}
    ${createQuestionType}
    ${createQuestions}
  `;
  const resultFromInit = await dbHelper.executePgQuery({
    query: queryToExecute,
    values: [],
    dbConfig: postgresConfig,
  });
  if (resultFromInit.error) {
    throw new Error(
      `Failed to initialize database. Error: ${resultFromInit.error}`
    );
  }
}
