import { WebSocket } from "ws";
import { lobbyEvent } from "./types/lobbyEvent";

export default class chatHandler {
  readonly #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #listener = async (senderId: string, message: string) => {
    this.#socket.send(`${senderId}: ${message}.`);
  };

  init() {
    this.#socket.on(lobbyEvent.RECEIVE_MESSAGE, this.#listener);
  }

  destroy() {
    this.#socket.off(lobbyEvent.RECEIVE_MESSAGE, this.#listener);
  }
}
