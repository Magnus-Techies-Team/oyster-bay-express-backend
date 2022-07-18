import { User } from "./user";
import { lobbyStatus } from "./lobbyConstants";
import { Quiz } from "./Quiz";

export type Lobby = {
  id: string;
  users: User[];
  hostId: string;
  quizId: string;
  maxPlayers: number;
  state: lobbyStatus; // уже запущена или нет
  quiz?: Quiz; // хранить сам квиз
};
