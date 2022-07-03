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
  });
  if (resultFromInit.error) {
    throw new Error(
      `Failed to initialize database. Error: ${resultFromInit.error}`
    );
  }
}
