import { User } from "./user";

export type Lobby = {
  id: string;
  users: User[];
  hostId: string;
  quizId: string;
  maxPlayers: number;
};
