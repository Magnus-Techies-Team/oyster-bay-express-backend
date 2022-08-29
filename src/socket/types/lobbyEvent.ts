export enum lobbyEvent {
  USER_JOIN = "user_join_lobby",
  DISCONNECT = "disconnect",
  HOST_DISCONNECT = "host_disconnect",
  USER_DISCONNECT = "user_disconnect",
  RECEIVE_MESSAGE = "receive_message",
  START = "start",
  HOST_SET_QUESTION = "host_set_question",
  PLAYER_TAKE_QUESTION = "player_take_question",
  HOST_VALIDATED_ANSWER = "host_validated_answer",
  SWITCH_ROUND = "switch_round",
  END_LOBBY = "end_lobby",
}
