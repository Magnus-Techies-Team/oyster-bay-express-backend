import DBHelper from "./DBHelper";
import { 
  installExtencion, 
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
  const queryToExecute = `
    ${installExtencion}
    ${createUsers}
    ${createGoogleAuth}
    ${createGithubAuth}
    ${createDiscordAuth}
    ${createQuizz}
    ${createRound}
    ${createQuestionType}
    ${createQuestions}
  `;
  const resultFromInit = await DBHelper.executePgQuery(queryToExecute, [], postgresConfig)
  if (resultFromInit.error) {
    throw new Error(`Failed to initialize database. Error: ${resultFromInit.error}`)
  }
}