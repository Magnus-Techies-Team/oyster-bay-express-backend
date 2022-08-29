import {questionStatus} from "~/modules/lobbyModule/types/LobbyConstants";

export type Question = {
  id: string;
  question: string;
  answer: string;
  cost: number;
  topic: string;
  type: string;
  questionStatus: questionStatus;
};
