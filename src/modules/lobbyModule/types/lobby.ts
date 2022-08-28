import {lobbyCondition, lobbyStatus} from "./lobbyConstants";
import { Quiz } from "./Quiz";
import { Question } from "./Question";
import {ExtendedUserInfo, BasicUserInfo} from "~/modules/lobbyModule/types/User";

export type Lobby = {
  id: string;
  host: BasicUserInfo;
  users: Map<string, ExtendedUserInfo>;
  quizId: string;
  maxPlayers: number;
  state: lobbyStatus; // уже запущена или нет
  currentRound?: number;
  currentQuestion?: Question;
  quiz?: Quiz; // хранить сам квиз
  assignee?: string; // тот, кто отвечает
  condition?: lobbyCondition;
};
