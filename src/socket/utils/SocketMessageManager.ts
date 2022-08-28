import {cloneDeep} from "lodash";
import {Question} from "~/modules/lobbyModule/types/Question";

export default class SocketMessageManager {
  generateString(data: { [key: string]: any }): string {
    return JSON.stringify(this.generateJson(data));
  }
  generateJson(data: { [key: string]: any }): { [key: string]: any } {
    const result = cloneDeep(data);
    if (result.lobby) {
      if (result.lobby.users) result.lobby.users = Object.values(data.lobby.users);
      if (result.lobby.spectators) result.lobby.spectators = Object.values(data.lobby.spectators);
      if (result.lobby.quiz) {
        result.lobby.questions = Object.values(result.lobby.quiz.rounds).reduce((prev: any, cur: any) => [...prev, ...cur], []);
        result.lobby.questions = result.lobby.questions.map((el: Question) => { return {id: el.id, questionStatus: el.questionStatus};});
        delete result.lobby.quiz;
      }
    }
    return { response: result };
  }
}
