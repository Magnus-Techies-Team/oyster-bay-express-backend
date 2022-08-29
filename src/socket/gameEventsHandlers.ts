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
    body: {lobby: Lobby, winner: ExtendedUserInfo}
  ) => {
    this.#socket.send(socketMessageManager.generateString({lobby: body.lobby, winner: body.winner}));
    socketRegistry.remove(this.#socket);
  };

  init(): void {
    this.#socket.on(LobbyMethod.SET_QUESTION, this.#setQuestionListener);
    this.#socket.on(lobbyEvent.HOST_SET_QUESTION, this.#hostSetQuestionListener);
    this.#socket.on(LobbyMethod.TAKE_QUESTION, this.#takeQuestionListener);
    this.#socket.on(lobbyEvent.PLAYER_TAKE_QUESTION, this.#playerTakeQuestionListener);
    this.#socket.on(LobbyMethod.VALIDATE_ANSWER, this.#validateAnswerListener);
    this.#socket.on(lobbyEvent.HOST_VALIDATED_ANSWER, this.#hostValidatedAnswerListener);
    this.#socket.on(lobbyEvent.SWITCH_ROUND, this.#switchRoundListener);
    this.#socket.on(lobbyEvent.END_LOBBY, this.#endLobbyListener);
  }

  destroy(): void {
    this.#socket.off(LobbyMethod.SET_QUESTION, this.#setQuestionListener);
    this.#socket.off(lobbyEvent.HOST_SET_QUESTION, this.#setQuestionListener);
    this.#socket.off(LobbyMethod.TAKE_QUESTION, this.#takeQuestionListener);
    this.#socket.off(lobbyEvent.PLAYER_TAKE_QUESTION, this.#playerTakeQuestionListener);
    this.#socket.off(LobbyMethod.VALIDATE_ANSWER, this.#validateAnswerListener);
    this.#socket.off(lobbyEvent.HOST_VALIDATED_ANSWER, this.#hostValidatedAnswerListener);
    this.#socket.off(lobbyEvent.SWITCH_ROUND, this.#switchRoundListener);
    this.#socket.off(lobbyEvent.END_LOBBY, this.#endLobbyListener);
  }
}
