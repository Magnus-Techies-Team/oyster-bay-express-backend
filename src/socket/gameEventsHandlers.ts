import { WebSocket } from "ws";
import { lobbyEvent } from "~/socket/types/lobbyEvent";
import { lobbyManager, socketMessageManager } from "~/projectDependencies";
import { questionHandlerBody } from "./types/wsInterface";

export default class gameEventsHandler {
  readonly #socket: WebSocket;
  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #setQuestionListener = (
    body: questionHandlerBody & { questionId: string }
  ) => {
    const lobby = lobbyManager.setQuestion(body);
    if (lobby.error) {
      this.#socket.send(
        socketMessageManager.generateString({ error: lobby.error })
      );
    } else {
      this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
    }
  };

  readonly #takeQuestionListener = (body: questionHandlerBody) => {
    const lobby = lobbyManager.takeQuestion(body);
    if (lobby.error) {
      this.#socket.send(
        socketMessageManager.generateString({ error: lobby.error })
      );
    } else {
      this.#socket.send(socketMessageManager.generateString({ lobby: lobby }));
    }
  };

  // readonly #validateQuestion = (
  //     body: {}
  // ) => {
  //
  // }

  init(): void {
    this.#socket.on(lobbyEvent.SET_QUESTION, this.#setQuestionListener);
    this.#socket.on(lobbyEvent.TAKE_QUESTION, this.#takeQuestionListener);
  }

  destroy(): void {
    this.#socket.off(lobbyEvent.SET_QUESTION, this.#setQuestionListener);
    this.#socket.off(lobbyEvent.TAKE_QUESTION, this.#takeQuestionListener);
  }
}
