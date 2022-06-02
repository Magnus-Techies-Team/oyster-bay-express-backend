import DBHelper from "./DBHelper";
import {
  installExtension,
  createUsers,
  createGoogleAuth,
  createGithubAuth,
  createDiscordAuth,
  createQuiz,
  createRound,
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
    ${createRound}
    ${createQuestionType}
    ${createQuestions}
  `;
  const resultFromInit = await DBHelper.executePgQuery(
    queryToExecute,
    [],
    postgresConfig
  );
  if (resultFromInit.error) {
    throw new Error(
      `Failed to initialize database. Error: ${resultFromInit.error}`
    );
  }
}
