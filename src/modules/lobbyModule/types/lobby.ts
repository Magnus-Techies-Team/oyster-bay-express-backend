import { User } from "./user";
import { lobbyStatus } from "./lobbyConstants";
import { Quiz } from "./Quiz";
import { Question } from "./Question";
import { Round } from "./Round";

export type Lobby = {
  id: string;
  users: User[];
  hostId: string;
  quizId: string;
  maxPlayers: number;
  state: lobbyStatus; // уже запущена или нет
  currentRound?: Round;
  currentQuestion?: Question;
  quiz?: Quiz; // хранить сам квиз
};
