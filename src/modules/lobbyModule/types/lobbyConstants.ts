export enum lobbyStatus {
  STARTED = "started",
  WAITING = "waiting",
}

export enum lobbyCondition {
  PLAYER_CHOOSES_QUESTION = "player_chooses_question",
  PLAYERS_TAKE_QUESTION = "players_take_question",
  HOST_VALIDATES_ANSWER = "host_validates_answer",
}

export enum questionStatus {
  ACTIVE = "active",
  TAKEN = "taken",
  NOT_TAKEN = "not_taken",
}

export enum userStatus {
  HOST = "host",
  PLAYER = "player",
  SPECTATOR = "spectator",
}

export enum userState {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
}

export const MAX_PLAYER_COUNT = 5;
export const MIN_PLAYER_COUNT = 1;
export const ANSWER_QUESTION_TIMEOUT = 20_000;
export const QUESTION_CANCEL_TIMEOUT = 20_000;
