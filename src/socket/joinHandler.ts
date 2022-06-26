import { WebSocket } from "ws";
import { lobbyEvent } from "./types/lobbyEvent";

export default class joinHandler {
  readonly #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #listener = async (newClientId: string) => {
    this.#socket.send(`New player ${newClientId} has just enrolled.`);
  };

  init(): void {
    this.#socket.on(lobbyEvent.JOIN, this.#listener);
  }

  destroy(): void {
    this.#socket.off(lobbyEvent.JOIN, this.#listener);
  }
}
