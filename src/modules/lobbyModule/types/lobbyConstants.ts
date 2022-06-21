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

export const MAX_PLAYER_COUNT = 5;
