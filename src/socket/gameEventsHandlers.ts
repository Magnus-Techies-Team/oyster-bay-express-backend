import { WebSocket } from "ws";
import { LobbyEvent } from "~/socket/types/lobbyEvent";
import {lobbyManager, socketMessageManager, socketRegistry} from "~/projectDependencies";
import {
  defaultActionHandlerBody, defaultHandlerResponse,
  // answerQuestionHandlerBody,
  questionHandlerBody,
  validateQuestionHandlerBody
} from "./types/wsInterface";
import {Lobby} from "~/modules/lobbyModule/types/lobby";
import {ExtendedUserInfo} from "~/modules/lobbyModule/types/User";
import {LobbyMethod} from "~/socket/types/lobbyMethod";

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
    body: defaultHandlerResponse
  ) => {
    this.#socket.send(socketMessageManager.generateString(body));
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
    body: defaultHandlerResponse
  ) => {
    this.#socket.send(
      socketMessageManager.generateString(body)
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
    body: defaultHandlerResponse
  ) => {
    this.#socket.send(
      socketMessageManager.generateString(body)
    );
  };

  readonly #switchRoundListener = (
    body: defaultHandlerResponse
  ) => {
    this.#socket.send(socketMessageManager.generateString(body));
  };

  readonly #endLobbyListener = (
    body: {lobby: Lobby, winner: ExtendedUserInfo}
  ) => {
    this.#socket.send(socketMessageManager.generateString(body));
    socketRegistry.remove(this.#socket);
  };

  init(): void {
    this.#socket.on(LobbyMethod.SET_QUESTION, this.#setQuestionListener);
    this.#socket.on(LobbyEvent.HOST_SET_QUESTION, this.#hostSetQuestionListener);
    this.#socket.on(LobbyMethod.TAKE_QUESTION, this.#takeQuestionListener);
    this.#socket.on(LobbyEvent.PLAYER_TAKE_QUESTION, this.#playerTakeQuestionListener);
    this.#socket.on(LobbyMethod.VALIDATE_ANSWER, this.#validateAnswerListener);
    this.#socket.on(LobbyEvent.HOST_VALIDATED_ANSWER, this.#hostValidatedAnswerListener);
    this.#socket.on(LobbyEvent.SWITCH_ROUND, this.#switchRoundListener);
    this.#socket.on(LobbyEvent.END_LOBBY, this.#endLobbyListener);
  }

  destroy(): void {
    this.#socket.off(LobbyMethod.SET_QUESTION, this.#setQuestionListener);
    this.#socket.off(LobbyEvent.HOST_SET_QUESTION, this.#setQuestionListener);
    this.#socket.off(LobbyMethod.TAKE_QUESTION, this.#takeQuestionListener);
    this.#socket.off(LobbyEvent.PLAYER_TAKE_QUESTION, this.#playerTakeQuestionListener);
    this.#socket.off(LobbyMethod.VALIDATE_ANSWER, this.#validateAnswerListener);
    this.#socket.off(LobbyEvent.HOST_VALIDATED_ANSWER, this.#hostValidatedAnswerListener);
    this.#socket.off(LobbyEvent.SWITCH_ROUND, this.#switchRoundListener);
    this.#socket.off(LobbyEvent.END_LOBBY, this.#endLobbyListener);
  }
}
