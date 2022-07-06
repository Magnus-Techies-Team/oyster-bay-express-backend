import { WebSocket } from "ws";
import { lobbyEvent } from "./types/lobbyEvent";
import { Lobby } from "../modules/lobbyModule/types/lobby";

export default class startHandler {
  readonly #socket: WebSocket;

  constructor(socket: WebSocket) {
    this.#socket = socket;
  }

  readonly #listener = async (lobby: Lobby) => {
    this.#socket.send(lobby);
  };

  init(): void {
    this.#socket.on(lobbyEvent.START, this.#listener);
  }

  destroy(): void {
    this.#socket.off(lobbyEvent.START, this.#listener);
  }
}
