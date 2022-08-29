import {lobbyCondition, lobbyStatus} from "./LobbyConstants";
import { Quiz } from "./Quiz";
import { Question } from "./Question";
import {ExtendedUserInfo, BasicUserInfo} from "~/modules/lobbyModule/types/User";

export type Lobby = {
  id: string;
  host: BasicUserInfo;
  // users: Map<string, ExtendedUserInfo>;
  users: {[key: string]: ExtendedUserInfo};
  quizId: string;
  maxPlayers: number;
  state: lobbyStatus; // уже запущена или нет
  quiz: Quiz; // хранить сам квиз
  spectators: {[key: string]: BasicUserInfo};
  currentRound?: number;
  currentQuestion?: Question;
  assignee?: string; // тот, кто отвечает
  condition?: lobbyCondition;
};

// export type Lobby = {
//   id: string;
//   host: BasicUserInfo;
//   users: Map<string, ExtendedUserInfo>;
//   maxPlayers: number;
//   state: lobbyStatus; // уже запущена или нет
//   currentRound?: number;
//   currentQuestion?: Question;
//   assignee?: string; // тот, кто отвечает
//   condition?: lobbyCondition;
//   quizId: string;
//   quiz?: Quiz; // хранить сам квиз
// };

