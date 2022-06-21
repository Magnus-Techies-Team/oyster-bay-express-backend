export enum Tables {
  discord_auth = "discord_auth",
  github_auth = "github_auth",
  google_auth = "google_auth",
  questions = "questions",
  quiz = "quiz",
  rounds = "rounds",
  users = "users",
}

export const TableProperties = {
  discord_auth: {
    id: "id",
    email: "email",
    identifier: "identifier",
  },
  github_auth: {
    id: "id",
    email: "email",
    identifier: "identifier",
  },
  google_auth: {
    id: "id",
    email: "email",
    identifier: "identifier",
  },
  questions: {
    id: "id",
    question: "question",
    answer: "answer",
    round: "round",
    cost: "cost",
    topic: "topic",
    type: "type",
    file_path: "file_path",
  },
  quiz: {
    id: "id",
    title: "title",
    author: "author",
    private: "private",
    tags: "tags",
  },
  rounds: {
    id: "id",
    quiz: "quiz",
    round_number: "round_number",
  },
  users: {
    id: "id",
    login: "login",
    email: "email",
    password: "password",
  },
};
