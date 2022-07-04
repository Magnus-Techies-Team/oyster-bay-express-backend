import { WebSocket } from "ws";
import { lobbyEvent } from "./types/lobbyEvent";
import { Lobby } from "../modules/lobbyModule/types/lobby";

export default class joinHandler {
  readonly #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #listener = async (lobby: Lobby) => {
    this.#socket.send(JSON.stringify({ response: { lobby: lobby } }));
  };

  init(): void {
    this.#socket.on(lobbyEvent.USER_JOIN, this.#listener);
  }

  destroy(): void {
    this.#socket.off(lobbyEvent.USER_JOIN, this.#listener);
  }
}
