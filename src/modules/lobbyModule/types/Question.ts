import {questionStatus} from "~/modules/lobbyModule/types/lobbyConstants";

export type Question = {
  id: string;
  question: string;
  answer: string;
  cost: number;
  topic: string;
  type: string;
  questionStatus: questionStatus;
};
