export enum LobbyMethod {
    CREATE_LOBBY = "create_lobby",
    JOIN_LOBBY = "join_lobby",
    DISCONNECT = "disconnect",
    START_LOBBY = "start_lobby",
    SEND_MESSAGE = "send_message",
    SET_QUESTION = "set_question",
    TAKE_QUESTION = "take_question",
    ANSWER_QUESTION = "answer_question",
    VALIDATE_QUESTION = "validate_question",
}

// TODO: switch to these events instead of corresponding events in LobbyEvent