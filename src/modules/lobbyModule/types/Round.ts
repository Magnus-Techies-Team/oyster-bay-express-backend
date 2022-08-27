import { Question } from "./Question";

export type Round = {
  id: string;
  questions: Question[]; // TODO: switch to map<id, Question>
};
