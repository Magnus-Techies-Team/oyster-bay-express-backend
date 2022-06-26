import DBHelper from "./DBHelper";
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
  const resultFromInit = await DBHelper.executePgQuery({
    query: queryToExecute,
    values: [],
  });
  if (resultFromInit.error) {
    throw new Error(
      `Failed to initialize database. Error: ${resultFromInit.error}`
    );
  }
}
