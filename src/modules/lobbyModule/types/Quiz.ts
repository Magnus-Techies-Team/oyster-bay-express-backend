import { Round } from "./Round";

export type Quiz = {
  title: string,
  rounds: { [key:string]: Round };
};
