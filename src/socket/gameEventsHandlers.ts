import { WebSocket } from "ws";
import { lobbyEvent } from "~/socket/types/lobbyEvent";
import {lobbyManager, socketMessageManager, socketRegistry} from "~/projectDependencies";
import {
  // answerQuestionHandlerBody,
  questionHandlerBody,
  validateQuestionHandlerBody
} from "./types/wsInterface";

export default class gameEventsHandler {
  readonly #socket: WebSocket;
  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #setQuestionListener = (
    body: questionHandlerBody
  ) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    const lobby = lobbyManager.setQuestion({...body, clientId: <string>clientId});
    if (lobby.error) {
      this.#socket.send(
        socketMessageManager.generateString({ error: lobby.error })
      );
    } else {
      this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
    }
  };

  readonly #takeQuestionListener = (body: questionHandlerBody) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    const lobby = lobbyManager.takeQuestion({...body, clientId: <string>clientId});
    if (lobby.error) {
      this.#socket.send(
        socketMessageManager.generateString({ error: lobby.error })
      );
    }
    else {
      this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
    }
  };

  // readonly #answerQuestionListener = (
  //   body: answerQuestionHandlerBody
  // ) => {
  //   const clientId = socketRegistry.getClientId(this.#socket);
  //   const lobby = lobbyManager.answerQuestion({...body, clientId: <string>clientId});
  //   if (lobby.error) {
  //     this.#socket.send(
  //       socketMessageManager.generateString({ error: lobby.error })
  //     );
  //   }
  //   else {
  //     this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
  //   }
  // };

  readonly #validateQuestionListener = (
    body: validateQuestionHandlerBody
  ) => {
    const clientId = socketRegistry.getClientId(this.#socket);
    const lobby = lobbyManager.validateAnswer({...body, clientId: <string>clientId});
    if (lobby.error) {
      this.#socket.send(
        socketMessageManager.generateString({ error: lobby.error })
      );
    }
    else {
      this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
    }
  };

  // TODO: Send lobby object on switch round

  // readonly #switchRoundListener = (
  //     body: defaultActionHandlerBody
  // ) => {
  //
  // }

  // TODO: Send lobby object on end game

  init(): void {
    this.#socket.on(lobbyEvent.SET_QUESTION, this.#setQuestionListener);
    this.#socket.on(lobbyEvent.TAKE_QUESTION, this.#takeQuestionListener);
    // this.#socket.on(lobbyEvent.ANSWER_QUESTION, this.#answerQuestionListener);
    this.#socket.on(lobbyEvent.VALIDATE_QUESTION, this.#validateQuestionListener);
  }

  destroy(): void {
    this.#socket.off(lobbyEvent.SET_QUESTION, this.#setQuestionListener);
    this.#socket.off(lobbyEvent.TAKE_QUESTION, this.#takeQuestionListener);
    // this.#socket.off(lobbyEvent.ANSWER_QUESTION, this.#answerQuestionListener);
    this.#socket.off(lobbyEvent.VALIDATE_QUESTION, this.#validateQuestionListener);
  }
}
