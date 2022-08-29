import { WebSocket } from "ws";
import { lobbyEvent } from "~/socket/types/lobbyEvent";
import {lobbyManager, socketMessageManager, socketRegistry} from "~/projectDependencies";
import {
  defaultActionHandlerBody,
  // answerQuestionHandlerBody,
  questionHandlerBody,
  validateQuestionHandlerBody
} from "./types/wsInterface";
import {Lobby} from "~/modules/lobbyModule/types/lobby";
import {ActionInfo} from "~/modules/lobbyModule/utils/LobbyManager";

export default class gameEventsHandler {
  readonly #socket: WebSocket;
  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #setQuestionListener = (
    body: questionHandlerBody
  ) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    const lobby = lobbyManager.setQuestion({lobbyId: body.lobbyId, questionId: body.questionId, clientId: <string>clientId});
    if (lobby && lobby.error) {
      this.#socket.send(
        socketMessageManager.generateString({ error: lobby.error })
      );
    }
  };

  readonly #hostSetQuestionListener = (
    body: Lobby
  ) => {
    this.#socket.send(socketMessageManager.generateString({lobby: body}));
  };

  readonly #takeQuestionListener = (body: defaultActionHandlerBody) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    const lobby = lobbyManager.takeQuestion({...body, clientId: <string>clientId});
    if (lobby && lobby.error) {
      this.#socket.send(
        socketMessageManager.generateString({ error: lobby.error })
      );
    }
  };

  readonly #playerTakeQuestionListener = (
    body: {lobby: Lobby}
  ) => {
    this.#socket.send(
      socketMessageManager.generateString({lobby: body})
    );
  };

  readonly #validateAnswerListener = (
    body: validateQuestionHandlerBody
  ) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    const lobby = lobbyManager.validateAnswer({...body, clientId: <string>clientId});
    if (lobby && lobby.error) {
      this.#socket.send(
        socketMessageManager.generateString({ error: lobby.error })
      );
    }
  };

  readonly #hostValidatedAnswerListener = (
    body: {lobby: Lobby, actionInfo: ActionInfo}
  ) => {
    console.log(body);
    this.#socket.send(
      socketMessageManager.generateString({lobby: body.lobby, actionInfo: body.actionInfo})
    );
  };

  readonly #switchRoundListener = (
    body: {lobby: Lobby}
  ) => {
    this.#socket.send(socketMessageManager.generateString({lobby: body.lobby}));
  };

  readonly #endLobbyListener = (
    body: {lobby: Lobby}
  ) => {
    this.#socket.send(socketMessageManager.generateString({lobby: body.lobby}));
  };

  init(): void {
    this.#socket.on(lobbyEvent.SET_QUESTION, this.#setQuestionListener);
    this.#socket.on(lobbyEvent.HOST_SET_QUESTION, this.#hostSetQuestionListener);
    this.#socket.on(lobbyEvent.TAKE_QUESTION, this.#takeQuestionListener);
    this.#socket.on(lobbyEvent.PLAYER_TAKE_QUESTION, this.#playerTakeQuestionListener);
    this.#socket.on(lobbyEvent.VALIDATE_ANSWER, this.#validateAnswerListener);
    this.#socket.on(lobbyEvent.HOST_VALIDATED_ANSWER, this.#hostValidatedAnswerListener);
    this.#socket.on(lobbyEvent.SWITCH_ROUND, this.#switchRoundListener);
  }

  destroy(): void {
    this.#socket.off(lobbyEvent.SET_QUESTION, this.#setQuestionListener);
    this.#socket.off(lobbyEvent.HOST_SET_QUESTION, this.#setQuestionListener);
    this.#socket.off(lobbyEvent.TAKE_QUESTION, this.#takeQuestionListener);
    this.#socket.off(lobbyEvent.PLAYER_TAKE_QUESTION, this.#playerTakeQuestionListener);
    this.#socket.off(lobbyEvent.VALIDATE_ANSWER, this.#validateAnswerListener);
    this.#socket.off(lobbyEvent.HOST_VALIDATED_ANSWER, this.#hostValidatedAnswerListener);
    this.#socket.off(lobbyEvent.SWITCH_ROUND, this.#switchRoundListener);
    this.#socket.off(lobbyEvent.END_LOBBY, this.#endLobbyListener);
  }
}
