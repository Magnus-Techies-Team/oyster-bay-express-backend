import { lobbyStatus } from "./lobbyConstants";
import { Quiz } from "./Quiz";
import { Question } from "./Question";

export type Lobby = {
  id: string;
  users: Map<string, number>; // TODO: switch from User[] to Map<userId, userScore>
  hostId: string;
  quizId: string;
  maxPlayers: number;
  state: lobbyStatus; // уже запущена или нет
  currentRound?: number;
  currentQuestion?: Question;
  quiz?: Quiz; // хранить сам квиз
  assignee?: string,
};
