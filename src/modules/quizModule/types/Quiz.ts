export type Quiz = {
  title: string,
  private: boolean,
  tags: string[],
  questions: Question[]
}

export type Question = {
  question: string,
  round: number,
  answer: string,
  cost: number,
  topic: string,
  type: QuestionType,
  filepath: string | null,
};

export enum QuestionType {'text', 'image', 'audio'}