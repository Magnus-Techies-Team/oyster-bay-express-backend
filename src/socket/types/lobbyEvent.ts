export enum lobbyEvent {
  CREATE_LOBBY = "create_lobby",
  JOIN_LOBBY = "join_lobby",
  USER_JOIN = "user_join_lobby",
  DISCONNECT = "disconnect",
  HOST_DISCONNECT = "host_disconnect",
  USER_DISCONNECT = "user_disconnect",
  SEND_MESSAGE = "send_message",
  RECEIVE_MESSAGE = "receive_message",
  START_LOBBY = "start_lobby",
  START = "start",
  SET_QUESTION = "set_question",
  TAKE_QUESTION = "take_question",
  USER_TAKE_QUESTION = "user_take_question",
  ANSWER_QUESTION = "answer_question",
  USER_ANSWERED = "user_answered",
  VALIDATE_QUESTION = "validate_question",
  HOST_VALIDATED_ANSWER = "host_validated_answer",
  SWITCH_ROUND = "switch_round",
  END_LOBBY = "end_lobby",
}
