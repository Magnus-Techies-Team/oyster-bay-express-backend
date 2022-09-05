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

  readonly #takeQuestionListener = (body: defaultActionHandlerBody) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    const lobby = lobbyManager.takeQuestion({...body, clientId: <string>clientId});
    if (lobby && lobby.error) {
      this.#socket.send(
        socketMessageManager.generateString({ error: lobby.error })
      );
    }
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

  readonly #endLobbyListener = (
    body: {lobby: Lobby, winner: ExtendedUserInfo}
  ) => {
    this.#socket.send(socketMessageManager.generateString(body));
    socketRegistry.remove(this.#socket);
  };

  readonly #defaultResponseListener = (
    body: defaultHandlerResponse
  ) => {
    this.#socket.send(socketMessageManager.generateString(body));
  };

  init(): void {
    this.#socket.on(LobbyMethod.SET_QUESTION, this.#setQuestionListener);
    this.#socket.on(LobbyEvent.HOST_SET_QUESTION, this.#defaultResponseListener);
    this.#socket.on(LobbyMethod.TAKE_QUESTION, this.#takeQuestionListener);
    this.#socket.on(LobbyEvent.PLAYER_TAKE_QUESTION, this.#defaultResponseListener);
    this.#socket.on(LobbyMethod.VALIDATE_ANSWER, this.#validateAnswerListener);
    this.#socket.on(LobbyEvent.HOST_VALIDATED_ANSWER, this.#defaultResponseListener);
    this.#socket.on(LobbyEvent.SWITCH_ROUND, this.#defaultResponseListener);
    this.#socket.on(LobbyEvent.END_LOBBY, this.#endLobbyListener);
  }

  destroy(): void {
    this.#socket.off(LobbyMethod.SET_QUESTION, this.#setQuestionListener);
    this.#socket.off(LobbyEvent.HOST_SET_QUESTION, this.#defaultResponseListener);
    this.#socket.off(LobbyMethod.TAKE_QUESTION, this.#takeQuestionListener);
    this.#socket.off(LobbyEvent.PLAYER_TAKE_QUESTION, this.#defaultResponseListener);
    this.#socket.off(LobbyMethod.VALIDATE_ANSWER, this.#validateAnswerListener);
    this.#socket.off(LobbyEvent.HOST_VALIDATED_ANSWER, this.#defaultResponseListener);
    this.#socket.off(LobbyEvent.SWITCH_ROUND, this.#defaultResponseListener);
    this.#socket.off(LobbyEvent.END_LOBBY, this.#endLobbyListener);
  }
}
