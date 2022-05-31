import DBHelper from "./DBHelper";
import { 
  createDatabase, 
  createUsers,
  createGoogleAuth, 
  createGithubAuth, 
  createDiscordAuth,
  createQuizz, 
  createRound, 
  createQuestionType, 
  createQuestions,
} from "./dbQueries";
import { postgresConfig } from "./pgConfig";

export async function initLocalDatabasesIfNotExists(): Promise<any> {
  console.log(postgresConfig);
  const queryToExecute = `
    ${createUsers}
    ${createGoogleAuth}
    ${createGithubAuth}
    ${createDiscordAuth}
    ${createQuizz}
    ${createRound}
    ${createQuestionType}
    ${createQuestions}
  `;
  console.log(queryToExecute)
  const resultFromInit = await DBHelper.executePgQuery(queryToExecute, [], postgresConfig)
  if (resultFromInit.error) {
    throw new Error(`Failed to initialize database. Error: ${resultFromInit.error}`)
  }
}