export enum joinLobbyStatus {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  LOBBY_IS_FULL = "LOBBY_IS_FULL",
  ALREADY_JOINED = "ALREADY_JOINED",
  HOST_IN_GAME = "HOST_IN_GAME",
  ALREADY_IN_GAME = "ALREADY_IN_GAME",
}

export enum disconnectLobbyStatus {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
}

export enum startLobbyStatus {
  NOT_ENOUGH_PLAYERS = "NOT_ENOUGH_PLAYERS",
  NOT_HOST = "NOT_HOST",
}

export enum lobbyStatus {
  STARTED = "started",
  WAITING = "waiting",
}

export const MAX_PLAYER_COUNT = 5;
export const MIN_PLAYER_COUNT = 2;
export const ANSWER_QUESTION_TIMEOUT = 20_000;
export const QUESTION_CANCEL_TIMEOUT = 20_000;
