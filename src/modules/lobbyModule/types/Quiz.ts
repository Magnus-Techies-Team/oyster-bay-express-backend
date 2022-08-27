import { Round } from "./Round";

export type Quiz = {
  id: string;
  rounds: Round[]; // TODO: switch to map<id, Round>
};
