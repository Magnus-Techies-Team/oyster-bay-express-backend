import {lobbyCondition, lobbyStatus} from "./LobbyConstants";
import { Quiz } from "./Quiz";
import { Question } from "./Question";
import {ExtendedUserInfo, BasicUserInfo} from "~/modules/lobbyModule/types/User";

export type Lobby = {
  id: string;
  host: BasicUserInfo;
  users: {[key: string]: ExtendedUserInfo};
  quizId: string;
  maxPlayers: number;
  state: lobbyStatus;
  quiz: Quiz;
  spectators: {[key: string]: BasicUserInfo};
  currentRound?: number;
  currentQuestion?: Question;
  assignee?: string;
  condition?: lobbyCondition;
};

