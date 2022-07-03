import { WebSocket } from "ws";
import { lobbyEvent } from "./types/lobbyEvent";

export default class startHandler {
  readonly #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #listener = async () => {
    this.#socket.send(`Starting lobby.`); // TODO: send lobby object
  };

  init() {
    this.#socket.on(lobbyEvent.START, this.#listener);
  }

  destroy() {
    this.#socket.off(lobbyEvent.START, this.#listener);
  }
}
